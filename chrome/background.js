// background.js - Service Worker for ReadAllowed TTS

let isSpeaking = false;

console.log("ReadAllowed TTS Service Worker Initialized.");

// 1. Handle Extension Installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("ReadAllowed TTS Installed!");
});

// 2. Command Trigger (Mapped in manifest)
chrome.commands.onCommand.addListener((command) => {
  if (command === "read-highlight") {
    if (isSpeaking) {
      chrome.tts.stop();
      isSpeaking = false;
      return;
    }

    // Query active tab to pull Highlights
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getSelection" }, (response) => {
          if (chrome.runtime.lastError || !response || !response.text) {
             console.log("No selection found or talk failed.");
             return;
          }
          speak(response.text);
        });
      }
    });
  }
});

// 3. Main Speak Generator
function speak(text) {
  if (!text || text.trim().length === 0) return;

  isSpeaking = true;
  
  // Load settings from storage before speaking
  chrome.storage.sync.get(['selectedVoice', 'selectedSpeed', 'assistiveMode'], (data) => {
    const voice = data.selectedVoice || undefined;
    const rate = Number.parseFloat(data.selectedSpeed) || 1.0;
    const isAssistive = data.assistiveMode || false;

    let textToSpeak = text;
    if (isAssistive) {
        textToSpeak = "Now speaking selection. " + text;
    }

    chrome.tts.speak(textToSpeak, {
      voiceName: voice,
      rate: rate,

      enqueue: false, // Interrupt any current speech
      onEvent: (event) => {
        if (event.type === 'end' || event.type === 'interrupted' || event.type === 'error') {
          isSpeaking = false;
        }
      }
    });
  });
}


// 4. Message Listener (from Popup)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "speak") {
    speak(request.text);
    sendResponse({ status: "Speaking started" });
  } else if (request.action === "stop") {
    chrome.tts.stop();
    isSpeaking = false;
    sendResponse({ status: "Speaking stopped" });
  }
  return true; // Keep channel open
});
