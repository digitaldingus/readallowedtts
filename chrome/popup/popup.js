// popup.js - UI Logic for ReadAllowed

document.addEventListener("DOMContentLoaded", () => {
  const btnRead = document.getElementById("btn-read");
  const btnSync = document.getElementById("btn-sync");
  const statusText = document.getElementById("status-text");

  console.log("ReadAllowed Popup Loaded.");

  // 1. Check Background Connection
  chrome.runtime.sendMessage({ action: "ping" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Connection Error:", chrome.runtime.lastError);
      statusText.innerText = "Error Connecting";
      return;
    }
    console.log("Background Ping Response:", response);
    statusText.innerText = "Connected";
    statusText.style.color = "#3fb950"; // Success Green
  });

  // 2. Handle 'Read' Button Click
  btnRead.addEventListener("click", () => {
    // Query active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getPageMeta" }, (response) => {
          if (chrome.runtime.lastError) {
            alert("Could not talk to page. Content Script might not be loaded yet.");
            return;
          }
          alert(`Title: ${response.meta.title}\nSize: ${response.meta.contentSize} chars`);
        });
      }
    });
  });

  // 3. Handle 'Sync' Button Click (Native Bridge)
  btnSync.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "syncWithApp", text: "Hello from Popup" }, (response) => {
        alert(response.status);
    });
  });
});
