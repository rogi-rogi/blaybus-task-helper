// --- 탭 유틸 ---
function waitTabComplete(tabId){
  return new Promise(resolve=>{
    function onUpd(id, info, tab){
      if (id === tabId && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(onUpd);
        resolve(tab);
      }
    }
    chrome.tabs.onUpdated.addListener(onUpd);
  });
}
async function getOrOpenTab(url, {active=false} = {}){
  // 같은 URL을 이미 열어놨다면 재사용(단순 startsWith로도 OK)
  const all = await chrome.tabs.query({});
  const exist = all.find(t => t.url && t.url.startsWith("https://www.blaybus.com/"));
  if (exist) return exist;
  return await new Promise(res => chrome.tabs.create({ url, active }, res));
}
function sendToTab(tabId, message){
  return new Promise((resolve, reject)=>{
    chrome.tabs.sendMessage(tabId, message, (res)=>{
      const err = chrome.runtime.lastError;
      if (err) return reject(err);
      resolve(res);
    });
  });
}

// --- 팝업으로부터의 요청 처리 ---
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
        const wsUrl = (msg.workspaceUrl || "").trim();
        if (!wsUrl) { sendResponse({ ok:false, error:"workspaceUrl empty" }); return; }

        // 1) 워크스페이스 탭을 비활성으로 열거나 재사용
        const tab = await getOrOpenTab(wsUrl, { active:false });
        // 2) 해당 URL로 이동(재사용 탭일 수도 있으니 보정)
        await new Promise(res => chrome.tabs.update(tab.id, { url: wsUrl }, res));
        await waitTabComplete(tab.id);
        if (msg?.type === "CREATE_TASK_AND_START") {
            const response = await sendToTab(tab.id, {
                type: msg?.type,
                name: msg.name,
                rowSelector: msg.rowSelector || "table > tbody > tr:nth-child(1)"
            });

            sendResponse(response);
            return;
        } else if (msg?.type === "STOP_TASK") {
            const response = await sendToTab(tab.id, { type: msg?.type });

            sendResponse(response);
            return;
        }
    } catch (e) {
      sendResponse({ ok:false, error:String(e) });
      return;
    }
    sendResponse({ ok:false, error:"Unknown message" });
  })();
  return true; // async
});
