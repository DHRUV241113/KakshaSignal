import numpy as np
import wave
import os

def load_wav(path):
    with wave.open(path, 'rb') as wf:
        n_channels = wf.getnchannels()
        sampwidth = wf.getsampwidth()
        framerate = wf.getframerate()
        n_frames = wf.getnframes()
        data = wf.readframes(n_frames)
        
        if sampwidth == 2:
            samples = np.frombuffer(data, dtype=np.int16).astype(np.float32) / 32768.0
        else:
            raise ValueError(f"Unsupported sampwidth: {sampwidth}")
            
        if n_channels == 2:
            samples = (samples[0::2] + samples[1::2]) * 0.5
            
        return samples, framerate

def resample_linear(samples, orig_sr, target_sr):
    if orig_sr == target_sr:
        return samples
    target_len = int(len(samples) * target_sr / orig_sr)
    orig_idx = np.linspace(0, len(samples) - 1, target_len)
    return np.interp(orig_idx, np.arange(len(samples)), samples).astype(np.float32)

def build_master_audio(target_duration=178.0, sr=44100):
    total_samples = int(target_duration * sr)
    master_voice = np.zeros(total_samples, dtype=np.float32)
    bgm_gain = np.full(total_samples, 0.22, dtype=np.float32) # Default BGM level

    scene_cues = [
        ("scene1", 1.0),
        ("scene2", 22.0),
        ("scene3", 40.5),
        ("scene4", 68.5),
        ("scene5", 106.0),
        ("scene6", 130.0),
        ("scene7_part1", 150.8),
        ("scene7_part2", 160.2),
        ("scene7_part3", 168.8),
    ]

    ramp_len = int(0.4 * sr) # 400ms ducking ramp

    for sid, start_time in scene_cues:
        p = f"video_assets/audio/{sid}.wav"
        if os.path.exists(p):
            samples, orig_sr = load_wav(p)
            samples = resample_linear(samples, orig_sr, sr)
            
            # Normalize voice peak
            v_max = np.max(np.abs(samples))
            if v_max > 0:
                samples = samples / v_max * 0.88 # -1.1 dBFS peak

            start_idx = int(start_time * sr)
            end_idx = min(start_idx + len(samples), total_samples)
            actual_len = end_idx - start_idx
            
            master_voice[start_idx:end_idx] += samples[:actual_len]

            # Duck BGM down to 0.07 during narration
            d_start = max(0, start_idx - ramp_len)
            d_end = min(total_samples, end_idx + ramp_len)
            
            # Apply ducking
            # Ramp down
            r_down_end = min(start_idx, total_samples)
            if r_down_end > d_start:
                bgm_gain[d_start:r_down_end] = np.linspace(0.22, 0.07, r_down_end - d_start)
            
            # Hold low
            bgm_gain[start_idx:end_idx] = 0.07
            
            # Ramp up
            if d_end > end_idx:
                bgm_gain[end_idx:d_end] = np.linspace(0.07, 0.22, d_end - end_idx)

    # Load BGM
    bgm_path = "video_assets/audio/bgm.wav"
    bgm_samples, bgm_sr = load_wav(bgm_path)
    bgm_samples = resample_linear(bgm_samples, bgm_sr, sr)

    master_bgm = np.zeros(total_samples, dtype=np.float32)
    bgm_len = min(len(bgm_samples), total_samples)
    master_bgm[:bgm_len] = bgm_samples[:bgm_len]

    # Apply ducked gain to BGM
    master_bgm = master_bgm * bgm_gain

    # Mix
    final_mix = master_voice + master_bgm

    # Limiter
    peak = np.max(np.abs(final_mix))
    if peak > 0.95:
        final_mix = final_mix / peak * 0.95

    # Fade out final 2.5s
    fade_len = int(2.5 * sr)
    final_mix[-fade_len:] *= np.linspace(1, 0, fade_len)

    # Convert to 16-bit stereo
    stereo = np.zeros((total_samples, 2), dtype=np.int16)
    int_mix = (final_mix * 32767).astype(np.int16)
    stereo[:, 0] = int_mix
    stereo[:, 1] = int_mix

    out_file = "video_assets/audio/master_audio.wav"
    with wave.open(out_file, 'wb') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(stereo.tobytes())

    print(f"Master audio built: {out_file}, {target_duration}s, {total_samples} samples")

if __name__ == "__main__":
    build_master_audio(target_duration=178.0)
