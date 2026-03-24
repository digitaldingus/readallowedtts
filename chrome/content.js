// content.js - Content Script injected into all pages

console.log("ReadAllowed Content Script Injected on page: " + window.location.href);

// 1. Listen for messages from Background/Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in Content Script:", request);

  if (request.action === "getPageMeta") {
    const meta = {
      title: document.title,
      url: window.location.href,
      contentSize: document.body.innerText.length
    };
    sendResponse({ success: true, meta: meta });
  }

  return true; // Keep channel open
});

// 2. Simple UI Overlay (Example)
function showReadOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "read-allowed-overlay";
  overlay.innerHTML = `
    <div style="position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.8); color: #fff; padding: 10px 20px; border-radius: 8px; font-family: sans-serif; z-index: 9999; cursor: pointer;">
      ReadAllowed Active
    </div>
  `;
  document.body.appendChild(overlay);
}

// Triggering overlay as demo
showReadOverlay();
