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
        chrome.tabs.sendMessage(tabs[0].id, { action: "getSelection" }, (response) => {
          if (chrome.runtime.lastError || !response || !response.text) {
            alert("Please highlight some text on the page first!");
            return;
          }
          // Tell background script to speak the text
          chrome.runtime.sendMessage({ action: "speak", text: response.text });
          announce("Now speaking selection");
        });
      }
    });
  });


  // 3. Handle 'Stop' Button Click
  btnSync.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "stop" }, (response) => {
        announce("Speaking stopped");
    });
  });


  // 4. Load & Save Settings
  const voiceSelect = document.getElementById("voice-select");
  const speedSlider = document.getElementById("speed-slider");
  const speedVal = document.getElementById("speed-val");

  // A. Load Available Voices from Chrome TTS
  chrome.tts.getVoices((voices) => {
    voices.forEach(voice => {
      if (voice.voiceName) {
        const option = document.createElement("option");
        option.value = voice.voiceName;
        option.textContent = voice.voiceName;
        voiceSelect.appendChild(option);
      }
    });
    
    // B. Restore Saved Voice
    chrome.storage.sync.get(['selectedVoice'], (data) => {
       if (data.selectedVoice) {
           voiceSelect.value = data.selectedVoice;
       }
    });
  });

  // C. Restore Saved Speed
  chrome.storage.sync.get(['selectedSpeed'], (data) => {
       if (data.selectedSpeed) {
           speedSlider.value = data.selectedSpeed;
           speedVal.textContent = parseFloat(data.selectedSpeed).toFixed(1) + "x";
       }
  });

  // D. Save Settings on Change
  voiceSelect.addEventListener("change", () => {
       chrome.storage.sync.set({ selectedVoice: voiceSelect.value });
  });

  speedSlider.addEventListener("input", () => {
       const val = parseFloat(speedSlider.value).toFixed(1);
       speedVal.textContent = val + "x";
       chrome.storage.sync.set({ selectedSpeed: val });
  });

  // 5. Assistive Mode Announcements
  const assistiveToggle = document.getElementById("assistive-toggle");
  const announcer = document.getElementById("sr-announcer");

  function announce(text) {
    if (assistiveToggle && assistiveToggle.checked && announcer) {
      announcer.innerText = "";
      setTimeout(() => { announcer.innerText = text; }, 50);
    }
  }

  // Restore Assistive Mode
  if (assistiveToggle) {
    chrome.storage.sync.get(['assistiveMode'], (data) => {
      if (data.assistiveMode !== undefined) {
          assistiveToggle.checked = data.assistiveMode;
      }
    });

    assistiveToggle.addEventListener("change", () => {
      chrome.storage.sync.set({ assistiveMode: assistiveToggle.checked });
      announce(assistiveToggle.checked ? "Audible alerts turned on" : "Audible alerts turned off");
    });
  }
});


