/**
 * Generate simple WAV audio test files for development.
 * Run: npx tsx sample/generate-audio.ts
 *
 * Creates:
 *   public/assets/forest_theme.wav   — gentle looping tone (music)
 *   public/assets/village_theme.wav  — warmer looping tone (music)
 *   public/assets/bridge_theme.wav   — tense looping tone (music)
 *   public/assets/pickup.wav         — short rising tone (sfx)
 *   public/assets/footsteps.wav      — short noise burst (sfx)
 */
import { writeFileSync } from 'fs';

const SAMPLE_RATE = 22050;

/** Generate a sine wave buffer */
function sineWave(freq: number, duration: number, volume = 0.3): number[] {
  const samples = Math.floor(SAMPLE_RATE * duration);
  const buf: number[] = [];
  for (let i = 0; i < samples; i++) {
    const t = i / SAMPLE_RATE;
    // Fade in/out to avoid clicks
    const envelope = Math.min(1, t * 10, (duration - t) * 10);
    buf.push(Math.sin(2 * Math.PI * freq * t) * volume * envelope);
  }
  return buf;
}

/** Mix two buffers together */
function mix(a: number[], b: number[]): number[] {
  const len = Math.max(a.length, b.length);
  const out: number[] = [];
  for (let i = 0; i < len; i++) {
    out.push((a[i] || 0) + (b[i] || 0));
  }
  return out;
}

/** Convert float samples to 16-bit WAV file buffer */
function toWav(samples: number[]): Buffer {
  const numSamples = samples.length;
  const byteRate = SAMPLE_RATE * 2; // 16-bit mono
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);       // chunk size
  buffer.writeUInt16LE(1, 20);        // PCM
  buffer.writeUInt16LE(1, 22);        // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(2, 32);        // block align
  buffer.writeUInt16LE(16, 34);       // bits per sample

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(clamped * 32767), 44 + i * 2);
  }

  return buffer;
}

// --- Generate audio files ---

// Forest theme: gentle C major chord (C4 + E4 + G4), 3 seconds
const forestTheme = mix(
  mix(sineWave(261.6, 3, 0.2), sineWave(329.6, 3, 0.15)),
  sineWave(392.0, 3, 0.1)
);
writeFileSync('public/assets/forest_theme.wav', toWav(forestTheme));
console.log('Created forest_theme.wav (3s, C major)');

// Village theme: warm F major (F4 + A4 + C5), 3 seconds
const villageTheme = mix(
  mix(sineWave(349.2, 3, 0.2), sineWave(440.0, 3, 0.15)),
  sineWave(523.3, 3, 0.1)
);
writeFileSync('public/assets/village_theme.wav', toWav(villageTheme));
console.log('Created village_theme.wav (3s, F major)');

// Bridge theme: tense D minor (D4 + F4 + A4), 3 seconds
const bridgeTheme = mix(
  mix(sineWave(293.7, 3, 0.2), sineWave(349.2, 3, 0.15)),
  sineWave(440.0, 3, 0.1)
);
writeFileSync('public/assets/bridge_theme.wav', toWav(bridgeTheme));
console.log('Created bridge_theme.wav (3s, D minor)');

// Pickup SFX: rising tone C5→G5, 0.3 seconds
const pickup: number[] = [];
for (let i = 0; i < Math.floor(SAMPLE_RATE * 0.3); i++) {
  const t = i / SAMPLE_RATE;
  const freq = 523.3 + (784.0 - 523.3) * (t / 0.3);
  const envelope = Math.min(1, t * 30, (0.3 - t) * 15);
  pickup.push(Math.sin(2 * Math.PI * freq * t) * 0.4 * envelope);
}
writeFileSync('public/assets/pickup.wav', toWav(pickup));
console.log('Created pickup.wav (0.3s, rising tone)');

// Footsteps SFX: short noise burst, 0.2 seconds
const footsteps: number[] = [];
for (let i = 0; i < Math.floor(SAMPLE_RATE * 0.2); i++) {
  const t = i / SAMPLE_RATE;
  const envelope = Math.min(1, t * 50, (0.2 - t) * 20);
  footsteps.push((Math.random() * 2 - 1) * 0.25 * envelope);
}
writeFileSync('public/assets/footsteps.wav', toWav(footsteps));
console.log('Created footsteps.wav (0.2s, noise burst)');

console.log('\nDone! Audio test files created in public/assets/');
