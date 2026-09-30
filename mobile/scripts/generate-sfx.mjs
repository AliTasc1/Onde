#!/usr/bin/env node
/**
 * Generates background sounds from ambience/prompts.json with ElevenLabs
 * Sound Effects, saves them into assets/ambience/<group>/<id>.mp3 and
 * refreshes the ambience manifest.
 *
 *   npm run sfx
 *   npm run sfx -- --only breath_sigh_01 --force
 *
 * Uses ELEVENLABS_API_KEY from the environment or mobile/.env.local.
 */
import { Buffer } from 'node:buffer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { writeAmbienceManifest } from './build-ambience.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

for (const name of ['.env.local', '.env.local.txt']) {
  const f = path.join(root, name);
  if (!fs.existsSync(f)) continue;
  for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = line.replace(/^﻿/, '').match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  break;
}

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : null; };
const only = arg('only');
const force = process.argv.includes('--force');
const apiKey = process.env.ELEVENLABS_API_KEY;
const { sounds } = JSON.parse(fs.readFileSync(path.join(root, 'ambience', 'prompts.json'), 'utf8'));

async function main() {
  if (!apiKey) {
    console.error('Set ELEVENLABS_API_KEY (environment or mobile/.env.local).');
    process.exitCode = 1;
    return;
  }
  let made = 0;
  let failed = 0;
  for (const s of sounds) {
    if (only && s.id !== only) continue;
    const dir = path.join(root, 'assets', 'ambience', ['bed', 'rhythm'].includes(s.group) ? s.group : 'accents');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${s.id}.mp3`);
    if (fs.existsSync(file) && !force) continue;
    try {
      const res = await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
        body: JSON.stringify({ text: s.text, duration_seconds: s.duration ?? null, prompt_influence: 0.5 }),
      });
      if (!res.ok) {
        const detail = (await res.text()).slice(0, 300);
        const hint = res.status === 401 ? ' → enable the Sound Effects permission on your API key.' : '';
        throw new Error(`HTTP ${res.status}: ${detail}${hint}`);
      }
      fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      made++;
      console.log(`✓ ${s.group}/${s.id}`);
    } catch (e) {
      failed++;
      console.error(`✗ ${s.id}: ${e.message}`);
    }
  }
  const c = writeAmbienceManifest();
  console.log(`\nDone: ${made} generated, ${failed} failed. Manifest: ${c.bed} bed, ${c.rhythm} rhythm, ${c.accents} accents.`);
  if (failed) process.exitCode = 1;
}

main();
