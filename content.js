// --- 유틸: URL 변경 대기 (SPA 대비) ---
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function waitForUrlChange(oldHref, {timeout=10000, interval=150}={}){
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (location.href !== oldHref) return location.href;
    await sleep(interval);
  }
  // 변경이 안되더라도 현재 주소 반환 (페이지가 내부 라우터로 늦게 바꿀 수도 있음)
  return location.href;
}

/* 페이지 로딩 대기 후 요소 불러오기 */
async function waitForSelector(doc, selector, { timeout = 10000, interval = 200 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const el = doc.querySelector(selector);
    if (el) return el;
    await sleep(interval);
  }
  throw new Error(`not found: ${selector}`);
}


// --- 요구 함수: 첫 번째 row 클릭 후 URL 반환 ---
async function openWorkPage(rowSelector = "table > tbody > tr:nth-child(1)") {
    const row = await waitForSelector(document, rowSelector);
    row.click();
    return waitForUrlChange(window.location.href);
}

async function createTaskBtn() {
  const btn = await waitForSelector(document, "div > div.flex.justify-end > button");
  btn.click();
  return btn;
}

// --- 테스크명 기입
// --- 테스크명 기입
async function fillAndCommitInput(name) {
  const input = await waitForSelector(
    document,
    "table > tbody > tr:nth-child(1) > td.pl-3 > input"
  );

  input.focus();
  setInputValueAndDispatch(input, name);
  await commitWithEnter(input);
  return input;
}

function setInputValueAndDispatch(input, value) {
  // HTMLInputElement의 네이티브 setter 사용 (React/Vue 대응)
  const setter =
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set ||
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;

  if (setter) setter.call(input, value);
  else input.value = value; // 폴백

  // 프레임워크에 값 변경을 알림
  input.dispatchEvent(new Event("input",  { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

async function commitWithEnter(input) {
  input.focus();
  const evInit = { bubbles: true, cancelable: true, key: "Enter", code: "Enter" };
  input.dispatchEvent(new KeyboardEvent("keydown",  evInit));
  input.dispatchEvent(new KeyboardEvent("keypress", evInit));
  input.dispatchEvent(new KeyboardEvent("keyup",    evInit));

  // 프레임워크가 '엔터 제출'을 처리할 여유
  await sleep(777);
}

// --- 작업 상태 전환 --- 
async function clickTaskToggleButton() {
  const taskBtn = await waitForSelector(document, "table > tbody > tr:nth-child(1) > td:nth-child(1) > div > button");
  taskBtn.click();
  return taskBtn;
}

// --- 메시지 핸들러 ---
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
        if (msg?.type === "CREATE_TASK_AND_START") {
            // 워크시트 열기
            await openWorkPage();

            // 테스크 생성
            await createTaskBtn();

            // 테스크 명 기입
            await fillAndCommitInput(msg?.name);

            // 작업 시작
            await clickTaskToggleButton();

            sendResponse({ ok: true });      
            return;

        } else if (msg?.type === "STOP_TASK") {
            // 워크시트 열기
            await openWorkPage();

            // 작업 종료
            await clickTaskToggleButton();
            
            sendResponse({ ok: true });      
            return;
        }
        
    } catch (e) {
      sendResponse({ ok: false, error: String(e) });
      return;
    }
    // unknown
    sendResponse({ ok: false, error: "Unknown message" });
  })();
  return true; // async
});
