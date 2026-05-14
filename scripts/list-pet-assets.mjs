import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://avffxvpwzpvlohoyqshb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Bk22JrUqpC4nd5ucHr9I8A_mvPk3uXc';
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listDir(prefix = '') {
  const result = await sb.storage.from('pets').list(prefix, {
    limit: 1000,
    sortBy: { column: 'name', order: 'asc' }
  });
  if (result.error) throw result.error;
  const rows = [];
  for (const item of result.data || []) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.metadata) rows.push(path);
    else rows.push(...await listDir(path));
  }
  return rows;
}

const rows = await listDir();
console.log(rows.filter(path => /\.png$/i.test(path)).join('\n'));
