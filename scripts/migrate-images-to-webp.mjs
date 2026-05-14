import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const SUPABASE_URL = 'https://avffxvpwzpvlohoyqshb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Bk22JrUqpC4nd5ucHr9I8A_mvPk3uXc';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const PET_BACKGROUNDS = [
  ['banner-images', 'pets/bg/warm.webp', 'https://avffxvpwzpvlohoyqshb.supabase.co/storage/v1/object/public/pets/bg/warm.png'],
  ['banner-images', 'pets/bg/warmmb.webp', 'https://avffxvpwzpvlohoyqshb.supabase.co/storage/v1/object/public/pets/bg/warmmb.png'],
  ['banner-images', 'pets/bg/forest.webp', 'https://avffxvpwzpvlohoyqshb.supabase.co/storage/v1/object/public/pets/bg/forest.png'],
  ['banner-images', 'pets/bg/forestmb.webp', 'https://avffxvpwzpvlohoyqshb.supabase.co/storage/v1/object/public/pets/bg/forestmb.png'],
  ['banner-images', 'pets/bg/night.webp', 'https://avffxvpwzpvlohoyqshb.supabase.co/storage/v1/object/public/pets/bg/night.png'],
  ['banner-images', 'pets/bg/nightmb.webp', 'https://avffxvpwzpvlohoyqshb.supabase.co/storage/v1/object/public/pets/bg/nightmb.png'],
  ['banner-images', 'pets/bg/sea.webp', 'https://avffxvpwzpvlohoyqshb.supabase.co/storage/v1/object/public/pets/bg/sea.png'],
  ['banner-images', 'pets/bg/seamb.webp', 'https://avffxvpwzpvlohoyqshb.supabase.co/storage/v1/object/public/pets/bg/seamb.png']
];

const BANNERS = [
  ['banner-images', 'migrated/xiaoyao-book-launch.webp', 'https://i.imgs.ovh/2026/04/21/Zw4Hi1.jpeg', 'xiaoyao-book-launch'],
  ['banner-images', 'migrated/xiaoyao-youth-voice.webp', 'http://www.senn.com.cn/UploadFiles/2025/2/202502121321047553.png', 'xiaoyao-youth-voice'],
  ['banner-images', 'migrated/xiaoyao-radio-visit.webp', 'https://i.imgs.ovh/2026/05/06/bf81e216fee307ec14634d406a80f111.jpg', 'xiaoyao-radio-visit']
];

async function download(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 XiaoyaoStudioImageMigration/1.0'
    }
  });
  if (!response.ok) throw new Error(`Download failed ${response.status} ${response.statusText}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

async function toWebp(input) {
  return sharp(input)
    .rotate()
    .webp({ quality: 82, effort: 5 })
    .toBuffer();
}

async function upload(bucket, path, body) {
  const result = await sb.storage.from(bucket).upload(path, body, {
    contentType: 'image/webp',
    cacheControl: '31536000',
    upsert: true
  });
  if (result.error) throw result.error;
  return sb.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

async function migrateOne([bucket, path, source, bannerId]) {
  const original = await download(source);
  const webp = await toWebp(original);
  const url = await upload(bucket, path, webp);
  if (bannerId) {
    const update = await sb.from('banners').update({ image: url }).eq('id', bannerId);
    if (update.error) throw update.error;
  }
  return {
    id: bannerId || path,
    bucket,
    path,
    source,
    url,
    originalBytes: original.length,
    webpBytes: webp.length
  };
}

const results = [];
for (const item of PET_BACKGROUNDS.concat(BANNERS)) {
  console.log(`Migrating ${item[2]} -> ${item[0]}/${item[1]}`);
  results.push(await migrateOne(item));
}

console.log(JSON.stringify(results, null, 2));
