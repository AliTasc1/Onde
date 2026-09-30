#!/usr/bin/env node
/**
 * Generates the rare background phrases (a woman and a man speaking softly
 * in the scene) with ElevenLabs and rebuilds src/data/ambienceManifest.ts.
 *
 *   npm run murmurs              # only missing clips
 *   npm run murmurs -- --force   # regenerate everything
 *
 * Settings come from the environment or from mobile/.env.local (git-ignored):
 *   ELEVENLABS_API_KEY=...          (required)
 *   ELEVENLABS_FEMALE_VOICE_ID=...  (required: the woman's voice)
 *   ELEVENLABS_MALE_VOICE_ID=...    (optional: the man's voice; defaults to ELEVENLABS_VOICE_ID)
 *   ELEVENLABS_MODEL=eleven_v3      (other models ignore the [tags])
 */
import { Buffer } from 'node:buffer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { writeAmbienceManifest } from './build-ambience.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvFile() {
  let f = path.join(root, '.env.local');
  if (!fs.existsSync(f) && fs.existsSync(f + '.txt')) f += '.txt';
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = line.replace(/^﻿/, '').match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

loadEnvFile();
const force = process.argv.includes('--force');
const apiKey = process.env.ELEVENLABS_API_KEY;
const voices = {
  female: process.env.ELEVENLABS_FEMALE_VOICE_ID,
  male: process.env.ELEVENLABS_MALE_VOICE_ID || process.env.ELEVENLABS_VOICE_ID,
};
const model = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
const isV3 = model.startsWith('eleven_v3');

const lines = JSON.parse(fs.readFileSync(path.join(root, 'voice', 'murmurs.tr.json'), 'utf8'));
const outDir = path.join(root, 'assets', 'ambience', 'murmurs');
fs.mkdirSync(outDir, { recursive: true });

async function synth(voiceId, text) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text: isV3 ? text : text.replace(/\[[^\]]*\]\s*/g, ''),
      model_id: model,
      voice_settings: isV3 ? { stability: 0.5, similarity_boost: 0.8 } : { stability: 0.3, similarity_boost: 0.8, style: 0.5, use_speaker_boost: true, speed: 0.9 },
      ...(isV3 ? { language_code: 'tr' } : {}),
    }),
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    const hint = res.status === 401 ? ' → API key is wrong or missing the Text to Speech permission.'
      : res.status === 404 ? ' → Voice ID not found. Add the voice to "My Voices" and copy its ID.'
        : res.status === 402 || /quota|credits/i.test(detail) ? ' → Not enough ElevenLabs credits.'
          : '';
    throw new Error(`HTTP ${res.status}: ${detail}${hint}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  if (!apiKey || !voices.female || !voices.male) {
    console.error('Set ELEVENLABS_API_KEY, ELEVENLABS_FEMALE_VOICE_ID and ELEVENLABS_VOICE_ID (or ELEVENLABS_MALE_VOICE_ID) in mobile/.env.local.');
    process.exitCode = 1;
    return;
  }
  let made = 0;
  let failed = 0;
  const keep = new Set();
  for (const who of ['female', 'male']) {
    for (const l of lines[who]) {
      const name = `${l.id}.mp3`;
      keep.add(name);
      const file = path.join(outDir, name);
      if (fs.existsSync(file) && !force) continue;
      try {
        fs.writeFileSync(file, await synth(voices[who], l.text));
        made++;
        console.log(`✓ ${l.id}  ${l.text}`);
      } catch (e) {
        failed++;
        console.error(`✗ ${l.id}: ${e.message}`);
      }
    }
  }
  for (const f of fs.readdirSync(outDir)) {
    if (f.endsWith('.mp3') && !keep.has(f)) {
      fs.unlinkSync(path.join(outDir, f));
      console.log(`– removed old clip ${f}`);
    }
  }
  const c = writeAmbienceManifest();
  console.log(`\nDone: ${made} generated, ${failed} failed. ${c.murmurs} phrases in the app.`);
  if (failed) process.exitCode = 1;
}

main();
