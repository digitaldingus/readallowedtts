// background.js - Service Worker for ReadAllowed Extension

console.log("ReadAllowed Service Worker Initialized.");

// 1. Handle Extension Installation/Updates
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("ReadAllowed Extension Installed!");
    // Set default storage values if needed
    chrome.storage.local.set({ enabled: true });
  }
});

// 2. Message Listener (from Content Script or Popup)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in background:", request);

  if (request.action === "ping") {
    sendResponse({ status: "pong", timestamp: Date.now() });
  }

  // Example: Forwarding to Native App (Antigravity Bridge)
  if (request.action === "syncWithApp") {
    // connectNative would be used here if the host is registered
    // chrome.runtime.sendNativeMessage('com.antigravity.host', { text: request.text }, (response) => { ... });
    sendResponse({ status: "Native Messaging logic placeholder triggered" });
  }

  return true; // Keep channel open for async response
});
