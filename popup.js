const DEFAULT_URL = "https://www.blaybus.com/project/1234/workspace?view=list";
const TASK_STATE_KEY = "currentTaskState";

const wsInput   = document.getElementById("ws");
const saveBtn   = document.getElementById("saveBtn");

const taskInput   = document.getElementById("taskInput");
const taskActions = document.getElementById("taskActions");
const stopBtn     = document.getElementById("stopBtn");

const toast      = document.querySelector(".toast");
const toastInner = document.getElementById("toastInner");

/* ==== Toast (Web Animations API) ==== */
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
let currentAnimIn = null, currentAnimOut = null, hideTimer = null;

async function hideToast() {
  if (currentAnimIn) { currentAnimIn.cancel(); currentAnimIn = null; }
  if (currentAnimOut) currentAnimOut.cancel();

  if (reducedMotion) {
    toastInner.style.opacity = "0";
    toastInner.style.transform = "translateY(8px) scale(.98)";
    return;
  }
  currentAnimOut = toastInner.animate(
    [
      { opacity: 1, transform: "translateY(0) scale(1)" },
      { opacity: 0, transform: "translateY(8px) scale(.98)" }
    ],
    { duration: 180, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" }
  );
  await currentAnimOut.finished.catch(() => {});
  currentAnimOut = null;
}

// 팝업 로드 시 저장된 값 불러오기
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const store = await new Promise((res) =>
        chrome.storage.sync.get({ workspaceUrl: DEFAULT_URL }, res)
        );
        wsInput.value = store.workspaceUrl || DEFAULT_URL;
    } catch (e) {
        // 확장 환경이 아닐 때(테스트용): fallback
        wsInput.value = localStorage.getItem("workspaceUrl") || DEFAULT_URL;
    }

  
    try {
        const { [TASK_STATE_KEY]: saved } = await new Promise(res =>
        chrome.storage.local.get([TASK_STATE_KEY], res)
        );
        renderFromTaskState(saved);
    } catch {
        renderFromTaskState(null);
    }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes[TASK_STATE_KEY]) {
    renderFromTaskState(changes[TASK_STATE_KEY].newValue);
  }
});

function showToast(msg = "저장되었습니다") {
  toastInner.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1600);
}

// 저장 버튼
saveBtn.addEventListener("click", async () => {
  const val = (wsInput.value || "").trim() || DEFAULT_URL;

  // 눌림 느낌
  saveBtn.style.transform = "translateY(3px) scale(.90)";
  setTimeout(() => (saveBtn.style.transform = ""), 120);

  try {
    if (chrome?.storage?.sync) {
      await new Promise((res) => chrome.storage.sync.set({ workspaceUrl: val }, res));
    } else {
      localStorage.setItem("workspaceUrl", val);
    }
    showToast("저장되었습니다");
  } catch (e) {
    showToast("저장 실패: " + (e?.message || e));
  }
});

// Enter로 저장
wsInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") saveBtn.click();
});


/* ==== Task 생성 UX ==== */
// 1) Enter → 시작: input 비활성화 + 정지 버튼 표시
taskInput.addEventListener("keydown", async (e) => {
    if (e.key !== "Enter") return;
    const name = taskInput.value.trim();
    if (!name) return;


    let workspaceUrl = DEFAULT_URL;
    try {
        const store = await new Promise((res) =>
        chrome.storage.sync.get({ workspaceUrl: DEFAULT_URL }, res)
        );
        workspaceUrl = store.workspaceUrl || DEFAULT_URL;
    } catch (err) {
        workspaceUrl = localStorage.getItem("workspaceUrl") || DEFAULT_URL;
    }


    chrome.runtime.sendMessage(
        { type: "CREATE_TASK_AND_START", workspaceUrl, name: name, rowSelector: "table > tbody > tr:nth-child(1)" },
        async (response) => {
            if (!response?.ok) {
                return;
            }


            await new Promise(res =>
                chrome.storage.local.set(
                { [TASK_STATE_KEY]: { running: true, name, startedAt: Date.now() } },
                res
                )
            );
            renderFromTaskState({ running: true, name, startedAt: Date.now() });

            taskInput.setAttribute("disabled", "true");
            taskActions.classList.remove("hidden");
        }
    );
});


// 2) 정지 버튼 클릭 → input 활성화(+ 값 초기화) + 버튼 숨김
stopBtn.addEventListener("click", async () => {
    let workspaceUrl = DEFAULT_URL;
    try {
        const store = await new Promise((res) =>
            chrome.storage.sync.get({ workspaceUrl: DEFAULT_URL }, res)
        );
        workspaceUrl = store.workspaceUrl || DEFAULT_URL;
    } catch (err) {
        workspaceUrl = localStorage.getItem("workspaceUrl") || DEFAULT_URL;
    }
    
    chrome.runtime.sendMessage(
        { type: "STOP_TASK", workspaceUrl },
        async (response) => {
            if (!response?.ok) {
                return;
            }
            
            await new Promise(res => chrome.storage.local.remove(TASK_STATE_KEY, res));

            // 즉시 UI 반영
            renderFromTaskState(null);
            taskInput.removeAttribute("disabled");
            taskActions.classList.add("hidden");
            taskInput.value = "";
        }
    );
});


function renderFromTaskState(state) {
  if (state?.running) {
    taskInput.value = state.name || "";
    taskInput.setAttribute("disabled", "true");
    taskActions.classList.remove("hidden");
  } else {
    taskInput.removeAttribute("disabled");
    // 필요 시 값을 유지하거나 비우기 선택
    // taskInput.value = "";
    taskActions.classList.add("hidden");
  }
}