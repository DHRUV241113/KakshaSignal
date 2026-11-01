import numpy as np
import wave
import struct

def generate_ambient_music(duration=178.0, sample_rate=44100, out_path="video_assets/audio/bgm.wav"):
    total_samples = int(duration * sample_rate)
    t = np.linspace(0, duration, total_samples, endpoint=False)
    audio = np.zeros(total_samples, dtype=np.float32)

    # Chord progression in D major / B minor: Dmaj7 - Bm7 - Gmaj7 - A7sus4 (each chord 4 beats at 80 bpm = 3.0s)
    chord_len = 3.0 # seconds per chord
    chords = [
        [146.83, 220.00, 277.18, 369.99], # D3, A3, C#4, F#4 (Dmaj7)
        [123.47, 185.00, 220.00, 293.66], # B2, F#3, A3, D4 (Bm7)
        [98.00, 146.83, 196.00, 293.66],  # G2, D3, G3, D4 (Gmaj7)
        [110.00, 164.81, 220.00, 293.66]  # A2, E3, A3, D4 (Asus4)
    ]

    # Warm synth pad drone across chords
    num_chords_total = int(np.ceil(duration / chord_len))
    for c_idx in range(num_chords_total):
        chord = chords[c_idx % len(chords)]
        start_t = c_idx * chord_len
        end_t = min(start_t + chord_len, duration)
        idx_start = int(start_t * sample_rate)
        idx_end = int(end_t * sample_rate)
        seg_len = idx_end - idx_start
        if seg_len <= 0:
            break

        seg_t = t[idx_start:idx_end] - start_t
        # Smooth window for chord transition
        win = np.sin(np.pi * (seg_t / chord_len)) ** 1.5

        chord_signal = np.zeros(seg_len, dtype=np.float32)
        for freq in chord:
            # Fundamental + soft second harmonic
            f_sig = 0.5 * np.sin(2 * np.pi * freq * seg_t) + 0.25 * np.sin(2 * np.pi * (freq * 2) * seg_t)
            # Gentle chorus/detune
            f_sig += 0.3 * np.sin(2 * np.pi * (freq * 1.003) * seg_t)
            chord_signal += f_sig

        audio[idx_start:idx_end] += chord_signal * win * 0.15

    # Gentle pulsing marimba / bell arpeggio every 0.375s (eighth notes at 80 bpm)
    note_interval = 0.375
    num_notes = int(duration / note_interval)
    for n in range(num_notes):
        n_time = n * note_interval
        c_idx = int(n_time / chord_len)
        chord = chords[c_idx % len(chords)]
        # Pick pitch based on pattern
        pattern = [0, 2, 1, 3, 2, 0, 3, 1]
        pitch_idx = pattern[n % len(pattern)]
        freq = chord[pitch_idx] * 2.0 # One octave higher

        n_samples = int(0.6 * sample_rate) # Note decay duration
        idx_start = int(n_time * sample_rate)
        idx_end = min(idx_start + n_samples, total_samples)
        actual_len = idx_end - idx_start
        if actual_len <= 0:
            break

        note_t = np.linspace(0, actual_len / sample_rate, actual_len, endpoint=False)
        decay = np.exp(-note_t * 6.0) # Bell decay
        bell = (np.sin(2 * np.pi * freq * note_t) + 
                0.3 * np.sin(2 * np.pi * freq * 2.76 * note_t) * np.exp(-note_t * 10.0))
        audio[idx_start:idx_end] += bell * decay * 0.08

    # Subtle soft kick / heart-beat pulse on beats 1 and 3 (every 1.5s)
    beat_interval = 1.5
    num_beats = int(duration / beat_interval)
    for b in range(num_beats):
        b_time = b * beat_interval
        b_samples = int(0.2 * sample_rate)
        idx_start = int(b_time * sample_rate)
        idx_end = min(idx_start + b_samples, total_samples)
        actual_len = idx_end - idx_start
        if actual_len <= 0:
            break
        b_t = np.linspace(0, actual_len / sample_rate, actual_len, endpoint=False)
        pulse = np.sin(2 * np.pi * 55.0 * np.exp(-b_t * 20.0) * b_t) * np.exp(-b_t * 12.0)
        audio[idx_start:idx_end] += pulse * 0.12

    # Global fade in (3s) and fade out (4s)
    fade_in_samples = int(3.0 * sample_rate)
    fade_out_samples = int(4.0 * sample_rate)
    audio[:fade_in_samples] *= np.linspace(0, 1, fade_in_samples)
    audio[-fade_out_samples:] *= np.linspace(1, 0, fade_out_samples)

    # Normalize to -18 dB peak so it stays well underneath narration
    max_val = np.max(np.abs(audio))
    if max_val > 0:
        audio = (audio / max_val) * 0.22 # -13 dBFS peak

    # Write 16-bit stereo PCM WAV
    stereo = np.zeros((total_samples, 2), dtype=np.int16)
    int_audio = (audio * 32767).astype(np.int16)
    stereo[:, 0] = int_audio
    stereo[:, 1] = int_audio

    with wave.open(out_path, 'wb') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(stereo.tobytes())

    print(f"Generated BGM: {out_path}, {duration}s, {total_samples} samples")

if __name__ == "__main__":
    generate_ambient_music(duration=178.0)
