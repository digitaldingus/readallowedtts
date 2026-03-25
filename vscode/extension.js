const vscode = require('vscode');
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

let currentVoiceProcess = null;
let statusBarItem = null;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('ReadAllowed Activated!');

    // 1. Setup Status Bar Controller (Universal rendering)
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(megaphone) Read";
    statusBarItem.tooltip = "ReadAllowed: Click to Start Reading";
    statusBarItem.command = "read-allowed.start";
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // 2. Register Start Command
    let startCommand = vscode.commands.registerCommand('read-allowed.start', async () => {
        if (currentVoiceProcess) {
            stopSpeaking();
            return;
        }

        try {
            const editor = vscode.window.activeTextEditor;
            let text = "";

            // A. Get Highlight
            if (editor && !editor.selection.isEmpty) {
                text = editor.document.getText(editor.selection);
            } else {
                // B. Ghost Copy simulation (Simulate Ctrl+C to grab Webview highlight)
                try {
                    const ghostScript = `
                        $old = Get-Clipboard -Format Text -ErrorAction SilentlyContinue;
                        $wshell = New-Object -ComObject Wscript.Shell;
                        $wshell.SendKeys("^c");
                        Start-Sleep -m 200;
                        $sel = Get-Clipboard -Format Text -ErrorAction SilentlyContinue;
                        if ($old) { Set-Clipboard -Value $old -ErrorAction SilentlyContinue; }
                        Write-Output $sel;
                    `;
                    const encodedGhost = Buffer.from(ghostScript, 'utf16le').toString('base64');
                    const res = cp.spawnSync('powershell.exe', [
                        '-NoProfile',
                        '-NonInteractive',
                        '-EncodedCommand',
                        encodedGhost
                    ], { windowsHide: true });

                    text = res.stdout.toString().trim();
                } catch (e) {
                    console.error("Ghost Copy failed", e);
                }

                // C. Last Ditch Fallback to static clipboard Reading
                if (!text || text.length === 0) {
                    text = await vscode.env.clipboard.readText();
                }
            }

            // B. Validation
            if (!text || typeof text !== 'string' || text.trim().length === 0) {
                vscode.window.showWarningMessage('No text found on highlight or clipboard.');
                return;
            }

            if (text.length > 20000) {
                vscode.window.showWarningMessage('Selection is large. Only reading the first 20,000 characters for safety.');
                text = text.substring(0, 20000);
            }

            // C. Interrupt Previous Process
            stopSpeaking();

            // D. Get Configuration
            const config = vscode.workspace.getConfiguration('read-allowed');
            const speed = config.get('speed', 0);
            const voice = config.get('voice', "");

            // E. Assistive Mode State Readout
            const isAssistive = config.get('assistiveMode', false) || vscode.workspace.getConfiguration('editor').get('accessibilitySupport') === 'on';
            if (isAssistive) {
                text = "Now reading selection. " + text;
            }


            // E. Create Trigger & Spawn Speech
            speakText(text, speed, voice);

        } catch (error) {
            vscode.window.showErrorMessage('ReadAllowed Error: ' + error.message);
        }
    });

    // 3. Register Stop Command
    let stopCommand = vscode.commands.registerCommand('read-allowed.stop', () => {
        stopSpeaking();
    });

    // 4. Register Select Voice Command
    let selectVoiceCommand = vscode.commands.registerCommand('read-allowed.selectVoice', async () => {
        try {
            const psScript = `
                Add-Type -AssemblyName System.Speech;
                $voice = New-Object System.Speech.Synthesis.SpeechSynthesizer;
                $voice.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name }
            `;
            const encodedScript = Buffer.from(psScript, 'utf16le').toString('base64');

            const res = cp.spawnSync('powershell.exe', [
                '-NoProfile',
                '-NonInteractive',
                '-EncodedCommand',
                encodedScript
            ], { windowsHide: true });

            if (res.error) {
                throw new Error(res.error.message);
            }

            const stdout = res.stdout.toString().trim();
            if (!stdout) {
                vscode.window.showWarningMessage('No voices found on this machine.');
                return;
            }

            const voices = stdout.split('\r\n').map(v => v.trim()).filter(v => v.length > 0);
            
            const selection = await vscode.window.showQuickPick(voices, {
                placeHolder: 'Select a Voice for ReadAllowed',
                title: 'Installed TTS Voices'
            });

            if (selection) {
                const config = vscode.workspace.getConfiguration('read-allowed');
                await config.update('voice', selection, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage(`ReadAllowed: Voice set to ${selection}`);
            }
        } catch (error) {
            vscode.window.showErrorMessage('Error selecting voice: ' + error.message);
        }
    });

    context.subscriptions.push(startCommand, stopCommand, selectVoiceCommand);

}

/**
 * Spawns PowerShell audio synthesizer
 */
function speakText(text, speed, voice) {
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    
    const tempPath = path.join(tempDir, 'tts-input.txt');
    
    // 1. Synchronous Write to avoid IO lock race
    fs.writeFileSync(tempPath, text, 'utf-8');

    // 2. Build PowerShell Script with strict quote-safety
    const psScript = `
        Add-Type -AssemblyName System.Speech;
        $voice = New-Object System.Speech.Synthesis.SpeechSynthesizer;
        $voice.Rate = ${speed};
        if ('${voice}') { $voice.SelectVoice('${voice}'); }
        $text = Get-Content '${tempPath}' -Raw;
        $voice.Speak($text);
    `;

    // 3. Base64 Encode Script to bypass ALL breaking argument parser bugs
    const encodedScript = Buffer.from(psScript, 'utf16le').toString('base64');

    // 4. Spawn Process securely
    currentVoiceProcess = cp.spawn('powershell.exe', [
        '-NoProfile',
        '-NonInteractive',
        '-EncodedCommand',
        encodedScript
    ], { windowsHide: true });

    // 5. Update UI Controller to "Stop"
    statusBarItem.text = `$(primitive-square) Stop`;
    statusBarItem.command = 'read-allowed.stop';
    statusBarItem.tooltip = "Click to Stop Reading";

    // 6. Lifecycle Events
    currentVoiceProcess.on('exit', () => {
        resetUI();
        try { fs.unlinkSync(tempPath); } catch (e) {} // Cleanup temp file debris
    });

    currentVoiceProcess.stderr.on('data', (data) => {
        console.error("SAPI Error:", data.toString());
    });
}

function stopSpeaking() {
    if (currentVoiceProcess) {
        // Force fully terminate the process TREE instantly
        try {
            cp.exec(`taskkill /F /T /PID ${currentVoiceProcess.pid}`);
        } catch (e) {
            currentVoiceProcess.kill('SIGKILL'); // Fallback
        }
        currentVoiceProcess = null;
    }
    resetUI();
}

function resetUI() {
    vscode.commands.executeCommand('setContext', 'read-allowed:isPlaying', false);
    if (statusBarItem) {
        statusBarItem.text = `$(megaphone) Read`;
        statusBarItem.command = 'read-allowed.start';
        statusBarItem.tooltip = "ReadAllowed: Click to Start Reading";
    }
}

function deactivate() {
    stopSpeaking();
}

module.exports = {
    activate,
    deactivate
};
