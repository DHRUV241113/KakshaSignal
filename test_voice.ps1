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
$voice = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices | Where-Object { $_.DisplayName -match "Heera|Ravi" } | Select-Object -First 1
if ($voice) {
    $synth.Voice = $voice
    Write-Host "Using voice: $($voice.DisplayName) ($($voice.Language))"
}

$streamOp = $synth.SynthesizeTextToStreamAsync("Welcome to KakshaSignal, a teacher-led adaptive learning system for Indian classrooms.")
$stream = Await $streamOp ([Windows.Media.SpeechSynthesis.SpeechSynthesisStream])

$outPath = Join-Path $PSScriptRoot "test_voice.wav"
$fileStream = [System.IO.File]::Create($outPath)
$netStream = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($stream)
$netStream.CopyTo($fileStream)
$fileStream.Close()
$netStream.Close()

Write-Host "Saved audio to $outPath, size: $((Get-Item $outPath).Length) bytes"
