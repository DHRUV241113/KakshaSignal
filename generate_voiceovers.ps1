Add-Type -AssemblyName System.Runtime.WindowsRuntime
$asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } | Select-Object -First 1

function Await($asyncOp, $type) {
    $m = $asTaskGeneric.MakeGenericMethod($type)
    $t = $m.Invoke($null, @($asyncOp))
    $t.Wait()
    return $t.Result
}

[Windows.Media.SpeechSynthesis.SpeechSynthesizer, Windows.Media, ContentType = WindowsRuntime] | Out-Null
$synth = New-Object Windows.Media.SpeechSynthesis.SpeechSynthesizer
$voice = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices | Where-Object { $_.DisplayName -match "Heera" } | Select-Object -First 1
if (-not $voice) {
    $voice = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices | Where-Object { $_.DisplayName -match "Ravi" } | Select-Object -First 1
}
$synth.Voice = $voice
Write-Host "Voice selected: $($voice.DisplayName)"

$audioDir = Join-Path $PSScriptRoot "video_assets\audio"
if (-not (Test-Path $audioDir)) {
    New-Item -ItemType Directory -Path $audioDir -Force | Out-Null
}

$scenesJsonPath = Join-Path $PSScriptRoot "scenes.json"
$scenes = Get-Content -Raw -Path $scenesJsonPath -Encoding UTF8 | ConvertFrom-Json

foreach ($s in $scenes) {
    $streamOp = $synth.SynthesizeTextToStreamAsync($s.text)
    $stream = Await $streamOp ([Windows.Media.SpeechSynthesis.SpeechSynthesisStream])
    $outPath = Join-Path $audioDir "$($s.id).wav"
    $fileStream = [System.IO.File]::Create($outPath)
    $netStream = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($stream)
    $netStream.CopyTo($fileStream)
    $fileStream.Close()
    $netStream.Close()
    Write-Host "Generated $($s.id).wav ($((Get-Item $outPath).Length) bytes)"
}
