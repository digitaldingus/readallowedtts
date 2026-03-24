# ReadAllowed TTS (Antigravity Extension)

High-performance Text-to-Speech assistant for the Antigravity IDE.

---

## 🔊 **How to Use**

### 1. **Sidebar Panels / Chat Webviews** 
- **Start**: Highlight text anywhere in the sidebar and press **`Ctrl + Alt + S`** on your keyboard.
- **Stop Anytime**: Pressing **`Ctrl + Alt + S`** again or clicking the Status bar icon instantly stops reading.
- **Automation**: Automatically captures highlights, reads it out loud, and invisibly restores your clipboards without mouse blur!

### 2. **Code Files / Standard Documents**
- **Trigger**: Highlight any sentence inside a Code Editor and press **`Ctrl + Alt + S`** (or click the bottom-right button).
- **Fallback (Read Clipboard)**: Clicking the button without highlighting any text will read absolute whatever is currently in your Workspace Clipboard directly!

---

## ⚙️ **Settings**
You can configure the following in `File` -> `Preferences` -> `Settings` -> `ReadAllowed`:
- **Speed**: Customize the rate of speech synthesis (-10 to 10).
- **Voice**: Set the exact name of your installed voice engine (e.g., 'Microsoft David').

---

## 🛠️ **Installation**
1.  Run `npx vsce package` in this directory to generate a `.vsix` bundle.
2.  Go to **Extensions** sidebar.
3.  Click Options menu (`...`) -> **Install from VSIX**.
