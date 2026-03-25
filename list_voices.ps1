Add-Type -AssemblyName System.Speech
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name }
