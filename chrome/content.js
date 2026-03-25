// content.js - Content Script injected into all pages

console.log("ReadAllowed TTS Content Script Loaded.");

// 1. Listen for messages from Background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelection") {
    const selectedText = window.getSelection().toString().trim();
    sendResponse({ text: selectedText });
  }
  return true; // Keep channel open
});
