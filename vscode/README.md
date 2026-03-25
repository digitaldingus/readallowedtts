# ReadAllowed TTS (Antigravity Extension)

High-performance Text-to-Speech assistant for the Antigravity IDE.

---

## 🔊 **How to Use**

Just highlight any text and click the **Read** button on your **Status Bar** (bottom-right of your IDE). 

<img src="assets/megaphone_white.png" width="36" style="vertical-align: middle; margin-right: 4px;" /> **Read** *(How it appears in your status bar)*

### 🖱️ **Where to Find the Button**
The button is located on the **bottom-right edge of your IDE Status Bar**, displaying a megaphone icon labeled **Read**. 

### 💡 **Alternative Tricks**
- **Shortcut**: Press **`Ctrl + Alt + S`** after highlighting text.
- **Auto-Read Selection**: Clicking the Megaphone button automatically captures highlighted code or text for instantaneous speech.
- **Fallback (Read Clipboard)**: Clicking the button without highlighting any text will read whatever is currently on your Clipboard directly!
- **💡 Pro-Tip**: To easily read a full response from an AI agent, just click the **"Copy"** button at the bottom of the response, and then click **Read** in the Status Bar to begin dictation.

---

## ⚙️ **Settings**
To configure settings, press **`Ctrl + Shift + P`** (or `F1`), type **`Preferences: Open Settings (UI)`**, and search for **`ReadAllowed`**:
- **Speed**: Customize the rate of speech synthesis (-10 to 10).
- **Voice**: Set the exact name of your voice engine (or use the custom **ReadAllowed: Select Voice** command from the Command Palette).


---

## ♿ **Accessibility Support (Assistive Mode)**
ReadAllowed includes optional support for navigators with lower vision or screen-reader requirements:
- **Auto-Detect**: Automatically turns on state announcements if you operate in VS Code with a full-system screen reader active.
- **Manual Toggle**: Search and check `"read-allowed.assistiveMode"` to force-trigger audible alert confirmations whenever dictation begins.

---

## 🛠️ **Installation**

### 🌐 **From Open VSX Marketplace**
In Open VSX Marketplace? Just click **Install**!

---

### 💻 **Manual Installation**
If you prefer to install it manually using are `.vsix` bundle:
1.  Run `npx vsce package` in this directory to generate a `.vsix` bundle.
2.  Go to **Extensions** sidebar in your IDE.
3.  Click Options menu (`...`) -> **Install from VSIX**.
