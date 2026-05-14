import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const SUPABASE_URL = 'https://avffxvpwzpvlohoyqshb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Bk22JrUqpC4nd5ucHr9I8A_mvPk3uXc';
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const TYPES = ['fox', 'owl', 'deer', 'otter', 'whale', 'dragon'];
const STAGES = [1, 2, 3, 4];
const ITEMS = ['', '_scarf', '_bow', '_hat', '_crown'];

function sourceUrl(type, stage, item) {
  return `${SUPABASE_URL}/storage/v1/object/public/pets/${type}/${type}${stage}${item}.png`;
}

function targetPath(type, stage, item) {
  return `pets/sprites/${type}/${type}${stage}${item}.webp`;
}

async function downloadIfExists(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  let response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 XiaoyaoStudioPetSpriteMigration/1.0' }
    });
  } catch (error) {
    console.warn(`Skip unreachable ${url}: ${error.message}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
  if (response.status === 404 || response.status === 400) return null;
  if (!response.ok) throw new Error(`Download failed ${response.status} ${response.statusText}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

async function upload(path, body) {
  const result = await sb.storage.from('banner-images').upload(path, body, {
    contentType: 'image/webp',
    cacheControl: '31536000',
    upsert: true
  });
  if (result.error) throw result.error;
  return sb.storage.from('banner-images').getPublicUrl(path).data.publicUrl;
}

const migrated = [];
const skipped = [];

for (const type of TYPES) {
  for (const stage of STAGES) {
    for (const item of ITEMS) {
      const source = sourceUrl(type, stage, item);
      const original = await downloadIfExists(source);
      if (!original) {
        skipped.push(source);
        continue;
      }
      const path = targetPath(type, stage, item);
      console.log(`Migrating ${source} -> banner-images/${path}`);
      const webp = await sharp(original)
        .rotate()
        .webp({ quality: 88, effort: 5, lossless: true })
        .toBuffer();
      const url = await upload(path, webp);
      migrated.push({
        type,
        stage,
        item: item || 'base',
        source,
        url,
        originalBytes: original.length,
        webpBytes: webp.length
      });
    }
  }
}

console.log(JSON.stringify({ migrated, skipped }, null, 2));
