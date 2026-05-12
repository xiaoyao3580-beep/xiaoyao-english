const SUPABASE_URL = 'https://avffxvpwzpvlohoyqshb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Bk22JrUqpC4nd5ucHr9I8A_mvPk3uXc';
const sb = window.supabase?.createClient ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
const LESSON_UPLOAD_BUCKET = 'lesson-files';
const BANNER_UPLOAD_BUCKET = 'banner-images';
const TEACHER = { id: 'xiaoyao', password: '929292', name: '肖瑶老师' };
const CLASS_ALIAS = { 'junior-ability': 'ms', economist: 'econ', others: 'adult' };
const REVERSE_ALIAS = { ms: 'junior-ability', econ: 'economist', adult: 'others' };
const HOME_LEVEL_ORDER = window.XY_HOME_LEVEL_ORDER || ['f2','a1','a1-plus','a2','a2-plus','junior-ability','swsy','others','economist'];
const state = { page: 'home', level: null, homeTab: 'courses', slide: 0, teacherTab: 'students', students: [], homework: [], banners: [], bannerError: '', logs: [], attendance: null, report: null, vote: null, pet: null, loading: true };
const app = document.getElementById('app');
const modalRoot = document.getElementById('modal-root');
const clickAudio = new Audio('click.mp3');
clickAudio.preload = 'auto';
clickAudio.volume = 0.4;
let audioUnlocked = false;
function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  clickAudio.play().then(() => {
    clickAudio.pause();
    clickAudio.currentTime = 0;
  }).catch(() => {});
}
function playClick() {
  try {
    clickAudio.currentTime = 0;
    clickAudio.play().catch(() => {});
  } catch {}
}
document.addEventListener('pointerdown', unlockAudio, { once: true });
const HOME_META = {
  f2:['Foundation','child_care','bg-[#ffc2cc]','text-[#b5084d]'], a1:['Starter','school','bg-[#e7e4ff]','text-[#5827fc]'],
  'a1-plus':['Beginner+','star','bg-[#fdd400]','text-[#594a00]'], a2:['Intermediate','emoji_events','bg-[#a192ff]','text-[#5827fc]'],
  'a2-plus':['Advanced Int.','auto_awesome','bg-[#d9ffe9]','text-[#18a76e]'], swsy:['Speaking','forum','bg-[#ffc2cc]/70','text-[#b5084d]'],
  'junior-ability':['Junior High Prep','import_contacts','bg-white','text-[#5827fc]'], economist:['Economist Reading','menu_book','bg-[#fdd400]/30','text-[#6d5a00]'],
  others:['Adult Speaking','record_voice_over','bg-[#ffc2cc]/55','text-[#b5084d]']
};
const LEVEL_META = {
  f2:['Foundation Track','child_care','from-[#b5084d] via-[#d83271] to-[#ffb0c5]','bg-[#ffc2cc]','text-[#b5084d]'],
  a1:['Starter Track','school','from-[#5827fc] via-[#7252ff] to-[#b3a7ff]','bg-[#e7e4ff]','text-[#5827fc]'],
  'a1-plus':['Beginner+ Track','star','from-[#8f67ff] via-[#a786ff] to-[#ded4ff]','bg-[#fdd400]','text-[#594a00]'],
  a2:['Intermediate Track','emoji_events','from-[#7350ff] via-[#8e73ff] to-[#c7bdff]','bg-[#a192ff]','text-[#5827fc]'],
  'a2-plus':['Advanced Int. Track','auto_awesome','from-[#18a76e] via-[#46c58e] to-[#c9ffe2]','bg-[#d9ffe9]','text-[#18a76e]'],
  swsy:['Speaking Studio','forum','from-[#b5084d] via-[#d9447e] to-[#ffc3d1]','bg-[#ffc2cc]/70','text-[#b5084d]'],
  'junior-ability':['Junior High Prep','import_contacts','from-[#5827fc] via-[#6f48ff] to-[#b5a9ff]','bg-white','text-[#5827fc]'],
  economist:['Economist Reading','menu_book','from-[#866500] via-[#b58d00] to-[#ffe27b]','bg-[#fdd400]/30','text-[#6d5a00]'],
  others:['Adult Speaking','record_voice_over','from-[#8d2e60] via-[#bb4b83] to-[#ffc1da]','bg-[#ffc2cc]/55','text-[#b5084d]']
};
const SLIDES = [
  ['Media Feature',['肖瑶老师','《高效英语学习法的“密码”》','新书发布会深圳举办'],'点击查看报道全文。','linear-gradient(135deg, rgba(88,39,252,0.78) 0%, rgba(161,146,255,0.74) 70%), url(https://i.imgs.ovh/2026/04/21/Zw4Hi1.jpeg)','center','https://life.china.com/2023-05/01/content_203736.html','xiaoyao-book-launch'],
  ['Studio Story',['肖瑶启言工作室：','用镜头语言，','让世界听见中国青少年的声音'],'点击查看专题报道。','linear-gradient(135deg, rgba(88,39,252,0.8) 0%, rgba(161,146,255,0.72) 70%), url(http://www.senn.com.cn/UploadFiles/2025/2/202502121321047553.png)','center','http://www.senn.com.cn/syzx/2025/02/11/208516.html','xiaoyao-youth-voice'],
  ['Studio Visit',['肖瑶老师','走进深圳交通广播电台'],'做客FM106.2，分享英语学习经验与教育心得','linear-gradient(135deg, rgba(88,39,252,0.8) 0%, rgba(161,146,255,0.72) 70%), url(https://i.imgs.ovh/2026/05/06/bf81e216fee307ec14634d406a80f111.jpg)','50% 65%','','xiaoyao-radio-visit']
];
const ATTENDANCE_STATUS = [
  ['present','打卡成功','fa-circle-check','bg-emerald-50 text-emerald-700 border-emerald-100'],
  ['exempt','豁免','fa-shield-heart','bg-sky-50 text-sky-700 border-sky-100'],
  ['absent','未打卡','fa-circle-xmark','bg-rose-50 text-rose-700 border-rose-100']
];
const PET_TYPES = [
  { id:'fox', label:'Fox', zh:'小狐狸', icon:'pets', tone:'from-[#fef3c7] via-white to-[#ffe4e6]', accent:'#f97316' },
  { id:'owl', label:'Owl', zh:'小夜鹰', icon:'flutter_dash', tone:'from-[#e0f2fe] via-white to-[#ede9fe]', accent:'#4f46e5' }
];
const PET_ENVIRONMENTS = [
  { id:'warm-sun', label:'暖阳', icon:'wb_sunny' },
  { id:'forest', label:'森林', icon:'forest' },
  { id:'starry', label:'星夜', icon:'nightlight' },
  { id:'ocean', label:'海边', icon:'waves' }
];
const DEFAULT_PET_ITEMS = [
  { item_key:'scarf', label:'围巾', price:40, sort_order:1, active:true },
  { item_key:'bow', label:'蝴蝶结', price:60, sort_order:2, active:true },
  { item_key:'hat', label:'帽子', price:100, sort_order:3, active:true },
  { item_key:'crown', label:'皇冠', price:180, sort_order:4, active:true }
];
const DEFAULT_PET_LEVELS = [
  { level:1, required_xp:0, stage:1 },
  { level:2, required_xp:100, stage:2 },
  { level:3, required_xp:250, stage:3 },
  { level:4, required_xp:450, stage:4 }
];
const DEFAULT_PET_REWARDS = [
  { tier_key:'high', label:'优秀', min_score:90, xp_reward:30, point_reward:20, sort_order:1, active:true },
  { tier_key:'medium', label:'达标', min_score:70, xp_reward:18, point_reward:12, sort_order:2, active:true },
  { tier_key:'low', label:'完成', min_score:0, xp_reward:8, point_reward:5, sort_order:3, active:true }
];
let carouselStartX = 0;
let carouselStartY = 0;
let suppressCarouselClick = false;
let carouselSuppressTimer = null;
let attendanceRequestSeq = 0;
let petSearchTimer = null;
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const currentUser = () => { try { return JSON.parse(localStorage.getItem('xy_user') || 'null'); } catch { return null; } };
function petCfg() {
  if (!state.pet) state.pet = { loading:false, loaded:false, missing:false, error:'', pets:[], inventory:[], itemRules:DEFAULT_PET_ITEMS.slice(), levelRules:DEFAULT_PET_LEVELS.slice(), rewardRules:DEFAULT_PET_REWARDS.slice(), events:[], activeStudentId:'', search:'' };
  return state.pet;
}
function petTypeMeta(type) { return PET_TYPES.find(p => p.id === type) || PET_TYPES[0]; }
function petEnvMeta(id) { return PET_ENVIRONMENTS.find(e => e.id === id) || PET_ENVIRONMENTS[0]; }
function petItems() { return (petCfg().itemRules.length ? petCfg().itemRules : DEFAULT_PET_ITEMS).slice().sort((a,b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0)); }
function petLevels() { return (petCfg().levelRules.length ? petCfg().levelRules : DEFAULT_PET_LEVELS).slice().sort((a,b) => Number(a.required_xp || 0) - Number(b.required_xp || 0)); }
function petRewards() { return (petCfg().rewardRules.length ? petCfg().rewardRules : DEFAULT_PET_REWARDS).slice().sort((a,b) => (Number(b.min_score) || 0) - (Number(a.min_score) || 0)); }
function petLevelInfo(pet) {
  const levels = petLevels();
  const xp = Math.max(0, Number(pet?.experience_points || 0));
  const auto = levels.reduce((best, row) => Number(row.required_xp || 0) <= xp ? row : best, levels[0] || DEFAULT_PET_LEVELS[0]);
  const manual = levels.find(row => Number(row.level) === Number(pet?.manual_level));
  const row = pet?.level_mode === 'manual' && manual ? manual : auto;
  const idx = levels.findIndex(level => Number(level.level) === Number(row.level));
  const next = levels[idx + 1] || null;
  const base = Number(row.required_xp || 0);
  const need = next ? Number(next.required_xp || base) : base;
  const progress = next && need > base ? Math.max(0, Math.min(100, Math.round((xp - base) / (need - base) * 100))) : 100;
  return { level:Number(row.level || 1), stage:Number(row.stage || row.level || 1), xp, nextXp:next ? need : null, progress };
}
function petAssetUrl(pet, info) {
  if (!pet) return '';
  const item = pet.equipped_item ? '_' + String(pet.equipped_item).replace(/[^a-z0-9_-]/gi, '') : '';
  const type = String(pet.pet_type || 'fox').replace(/[^a-z0-9_-]/gi, '');
  return SUPABASE_URL + '/storage/v1/object/public/pets/' + type + '/' + type + Number(info?.stage || 1) + item + '.png';
}
function petParticleNodes(mode = '') {
  const cls = mode === 'mini' ? ' pet-particle-mini' : '';
  return [1,2,3,4,5,6,7].map(i => '<span class="pet-particle pet-particle-' + i + cls + '"></span>').join('');
}
const petImagePreloadCache = new Map();
function preloadImage(src, timeout = 1800) {
  if (!src) return Promise.resolve(false);
  if (petImagePreloadCache.has(src)) return petImagePreloadCache.get(src);
  const promise = new Promise(resolve => {
    const img = new Image();
    let done = false;
    const finish = ok => {
      if (done) return;
      done = true;
      resolve(ok);
    };
    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.src = src;
    setTimeout(() => finish(false), timeout);
  });
  petImagePreloadCache.set(src, promise);
  return promise;
}
function preloadPetAsset(pet) {
  if (!pet) return Promise.resolve(false);
  return preloadImage(petAssetUrl(pet, petLevelInfo(pet)));
}
function preloadPetWardrobe(pet) {
  if (!pet) return;
  const variants = [null].concat(petItems().filter(item => item.active !== false).map(item => item.item_key));
  variants.forEach(itemKey => preloadPetAsset({ ...pet, equipped_item:itemKey }));
}
function petForStudent(studentId) { return petCfg().pets.find(p => String(p.student_id) === String(studentId)) || null; }
function petInventoryFor(studentId) { return petCfg().inventory.filter(i => String(i.student_id) === String(studentId)).map(i => i.item_key); }
function petEventsFor(studentId, limit = 5) { return petCfg().events.filter(e => String(e.student_id) === String(studentId)).slice(0, limit); }
function signedPetDelta(value) { const n = Number(value || 0); return (n > 0 ? '+' : '') + n; }
function petErrorMessage(error) {
  const msg = String(error && (error.message || error.details || error.hint) || error || '');
  if (msg.includes('42P01') || msg.includes('PGRST205')) return '请先在 Supabase 执行 supabase-pet-setup.sql。';
  if (/not enough/i.test(msg)) return '宠物积分不足。';
  if (/not owned/i.test(msg)) return '还没有获得这个装扮。';
  return msg || '宠物数据处理失败。';
}
async function loadPetData(showDone = false) {
  const cfg = petCfg();
  const u = currentUser();
  if (!sb) {
    cfg.loading = false;
    cfg.loaded = true;
    cfg.error = 'Supabase 客户端没有加载成功，请检查网络或刷新页面。';
    render();
    return;
  }
  cfg.loading = true; cfg.error = ''; render();
  const studentFilter = u && u.role === 'student' ? String(u.id) : '';
  const maybeEq = (query, col) => studentFilter ? query.eq(col, studentFilter) : query;
  const results = await Promise.all([
    maybeEq(sb.from('student_pets').select('*').order('updated_at', { ascending:false }), 'student_id'),
    maybeEq(sb.from('pet_inventory').select('*').order('acquired_at', { ascending:false }), 'student_id'),
    sb.from('pet_item_rules').select('*').order('sort_order', { ascending:true }),
    sb.from('pet_level_rules').select('*').order('level', { ascending:true }),
    sb.from('pet_reward_rules').select('*').order('sort_order', { ascending:true }),
    maybeEq(sb.from('pet_reward_events').select('*').order('created_at', { ascending:false }).limit(studentFilter ? 20 : 120), 'student_id')
  ]);
  const missing = results.some(r => r.error && (r.error.code === '42P01' || r.error.code === 'PGRST205'));
  cfg.loading = false; cfg.loaded = true; cfg.missing = missing;
  if (missing) cfg.error = '请先在 Supabase 执行 supabase-pet-setup.sql。';
  else {
    const fatal = results.map(r => r.error).filter(Boolean)[0];
    cfg.error = fatal ? petErrorMessage(fatal) : '';
  }
  if (!results[0].error) cfg.pets = results[0].data || [];
  if (!results[1].error) cfg.inventory = results[1].data || [];
  if (!results[2].error && results[2].data?.length) cfg.itemRules = results[2].data;
  if (!results[3].error && results[3].data?.length) cfg.levelRules = results[3].data;
  if (!results[4].error && results[4].data?.length) cfg.rewardRules = results[4].data;
  if (!results[5].error) cfg.events = results[5].data || [];
  if (!cfg.activeStudentId && cfg.pets[0]) cfg.activeStudentId = cfg.pets[0].student_id;
  if (showDone && !cfg.error) toast('宠物数据已刷新。');
  render();
}
const normalizeClass = c => REVERSE_ALIAS[c] || String(c || '').replace(/_/g, '-');
const classesOf = u => (u && Array.isArray(u.classes) ? u.classes : []).map(normalizeClass);
const dbClass = id => CLASS_ALIAS[id] || id;
const isAbsoluteUrl = value => /^https?:\/\//i.test(String(value || '').trim());
const normalizeLessonFile = file => String(file || '').trim().replace(/^classes\//,'');
const REMOTE_LESSON_KEY_PREFIX = 'xy_remote_lesson:';
function lessonHref(file, id) {
  const raw = normalizeLessonFile(file);
  const target = isAbsoluteUrl(raw) ? raw : new URL('classes/' + raw, location.href).href;
  const shouldProxy = isAbsoluteUrl(raw) || (location.protocol !== 'file:' && /\.html?(?:$|[?#])/i.test(raw));
  const levelId = id ? lessonLevelId(id) : '';
  if (shouldProxy) {
    if (id) localStorage.setItem(REMOTE_LESSON_KEY_PREFIX + id, target);
    const proxy = new URL('classes/lessons/player.html', location.href);
    if (id) proxy.searchParams.set('hwId', id);
    else proxy.searchParams.set('url', target);
    if (levelId) proxy.searchParams.set('class', levelId);
    return proxy.href;
  }
  const url = isAbsoluteUrl(raw) ? new URL(raw) : new URL('classes/' + raw, location.href);
  if (id) url.searchParams.set('hwId', id);
  if (levelId) url.searchParams.set('class', levelId);
  return url.href;
}
function shortHash(text) {
  let hash = 0;
  String(text || '').split('').forEach(ch => { hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0; });
  return Math.abs(hash).toString(36);
}
function lessonRecordId(classCode, unit, title) {
  const base = (classCode + '-' + unit + '-' + title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return (base || 'lesson') + '-' + shortHash(classCode + '|' + unit + '|' + title).slice(0, 5);
}
function storagePathFromLessonFile(file) {
  const raw = String(file || '').trim();
  if (!isAbsoluteUrl(raw)) return '';
  try {
    const path = new URL(raw).pathname;
    const marker = '/storage/v1/object/public/' + LESSON_UPLOAD_BUCKET + '/';
    const index = path.indexOf(marker);
    return index >= 0 ? decodeURIComponent(path.slice(index + marker.length)) : '';
  } catch {
    return '';
  }
}
async function uploadLessonFile(classCode, id, uploadFile) {
  if (!uploadFile) return { file:'', path:'' };
  if (!/\.html?$/i.test(uploadFile.name)) throw new Error('只支持上传 HTML 文件。');
  const storagePath = normalizeClass(classCode) + '/' + id + '-' + Date.now() + '.html';
  const upload = await sb.storage.from(LESSON_UPLOAD_BUCKET).upload(storagePath, uploadFile, { contentType:'text/html', upsert:true });
  if (upload.error) throw new Error('上传失败: ' + upload.error.message + '。请确认 Supabase Storage 已创建公开 bucket "' + LESSON_UPLOAD_BUCKET + '"，并允许当前 publishable key 上传。');
  const publicUrl = sb.storage.from(LESSON_UPLOAD_BUCKET).getPublicUrl(storagePath);
  const file = publicUrl && publicUrl.data ? publicUrl.data.publicUrl : '';
  if (!file) throw new Error('上传完成，但没有拿到公开访问链接。请检查 Storage bucket 是否为公开读取。');
  return { file, path:storagePath };
}
const levelById = id => window.XY_CONTENT_LEVELS.find(l => l.id === id) || null;
const modulesByLevel = id => window.XY_CONTENT_MODULES[id] || [];
const allModules = () => Object.values(window.XY_CONTENT_MODULES).flat();
const homeworkById = id => state.homework.find(h => h.id === id);
function normalizeBannerRow(b, i = 0) {
  return { id:b.id, image:b.image || '', link:b.link || '', tag:b.tag || 'Studio News', title:b.title || '', subtitle:b.subtitle || b.description || '点击查看详情。', position:b.position || 'center', sort_order:Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : i + 1, status:b.status || 'open', created_at:b.created_at || '' };
}
function routeTo(page, level, push = true) { state.page = page || 'home'; state.level = level || null; if (push) { const q = new URLSearchParams(); q.set('page', state.page); if (state.level) q.set('level', state.level); history.pushState(null, '', '?' + q.toString()); } render(); }
window.addEventListener('popstate', () => { const q = new URLSearchParams(location.search); routeTo(q.get('page') || 'home', q.get('level'), false); });
async function loadData() {
  state.loading = true;
  render();
  if (!sb) {
    state.loading = false;
    state.bannerError = 'Supabase 客户端没有加载成功，请检查网络或刷新页面。';
    render();
    toast('Supabase 客户端没有加载成功，请检查网络后刷新。');
    return;
  }
  try {
    const [students, homework, banners, logs] = await Promise.all([
      sb.from('students').select('*').order('id',{ascending:false}),
      sb.from('homework').select('*').order('date',{ascending:false}),
      sb.from('banners').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:true}),
      sb.from('growth_logs').select('*').order('created_at',{ascending:false}).limit(600)
    ]);
    state.students = students.data || [];
    state.homework = (homework.data || []).map(h => ({ id:h.id, classCode:normalizeClass(h.class_code), unit:h.unit, title:h.title, date:h.date, file:h.file, status:h.status }));
    state.bannerError = banners.error ? banners.error.message : '';
    state.banners = banners.error ? [] : (banners.data || []).map(normalizeBannerRow);
    state.logs = logs.data || [];
  } catch (e) {
    toast('Supabase 数据加载失败：' + e.message);
  } finally {
    state.loading = false;
    render();
  }
}
function topNav(back, title) { const u = currentUser(); const left = back ? '<button class="motion-button flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#5c2dff] shadow-[0_12px_30px_-12px_rgba(88,39,252,0.35)]" data-route="home" aria-label="Go back"><span class="material-symbols-outlined text-[22px]">arrow_back</span></button>' : '<div class="flex items-center gap-3"><span class="material-symbols-outlined text-[28px] text-[#5c2dff]">school</span><span class="bg-gradient-to-r from-[#5827fc] to-[#a192ff] bg-clip-text text-xl font-black text-transparent">Xiaoyao Studio</span></div>'; const icon = u ? 'logout' : 'login'; const label = u ? 'Logout' : 'Login'; return '<nav class="motion-nav-enter absolute inset-x-0 top-0 z-50 mx-auto flex w-full max-w-[74rem] items-center justify-between border-b border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.74)_0%,rgba(255,255,255,0.58)_55%,rgba(255,255,255,0.22)_100%)] px-4 py-4 backdrop-blur-[18px] shadow-[0_12px_40px_-8px_rgba(92,45,255,0.12)] sm:w-[calc(100%_-_2rem)] sm:px-6 md:top-4 md:rounded-full md:border lg:px-7" style="background-color:rgba(255,255,255,0.54)">' + left + '<div class="hidden flex-1 md:block"></div><button class="motion-button inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#5827fc] shadow-[0_12px_30px_-12px_rgba(88,39,252,0.55)]" ' + (u ? 'data-logout' : 'data-login') + '><span class="material-symbols-outlined text-[20px]">' + icon + '</span><span class="hidden sm:inline">' + label + '</span></button></nav>'; }
function bottomDock() { const u = currentUser(); const teacher = u && u.role === 'teacher'; const tab = (id,label,icon) => '<button data-home-tab="' + id + '" class="motion-tab flex min-h-[44px] flex-col items-center justify-center px-4 py-2 md:px-6 ' + (state.homeTab === id ? 'rounded-full bg-[#5c2dff] text-white shadow-[0_8px_20px_-4px_rgba(92,45,255,0.4)]' : 'text-[#74777c]') + '" aria-pressed="' + (state.homeTab === id) + '"><span class="material-symbols-outlined">' + icon + '</span><span class="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em]">' + label + '</span></button>'; return '<nav class="motion-dock-enter absolute inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[42rem] items-center justify-around rounded-t-[3rem] border-t border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.52)_28%,rgba(239,240,247,0.68)_100%)] px-4 py-3 backdrop-blur-[18px] shadow-[0_-12px_40px_-8px_rgba(92,45,255,0.12)] sm:w-[calc(100%_-_2rem)] md:bottom-5 md:rounded-full md:border" style="padding-bottom:calc(0.75rem + env(safe-area-inset-bottom,0px));background-color:rgba(239,240,247,0.6)">' + tab('courses','Courses','smart_toy') + tab('hub','My Hub','folder_shared') + (teacher ? '<button data-route="teacher" class="motion-tab flex min-h-[44px] flex-col items-center justify-center p-2 text-[#74777c]"><span class="material-symbols-outlined">dashboard_customize</span><span class="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em]">Teacher</span></button>' : '') + '</nav>'; }
function orderedLevels() { const all = window.XY_CONTENT_LEVELS.filter(l => l.id !== 'summer-uk-2026'); const byId = new Map(all.map(l => [l.id,l])); const ordered = HOME_LEVEL_ORDER.map(id => byId.get(id)).filter(Boolean); const seen = new Set(ordered.map(l => l.id)); return ordered.concat(all.filter(l => !seen.has(l.id))); }
function hasAccess(level) { const u = currentUser(); if (!u) return false; if (u.role === 'teacher') return true; return new Set(classesOf(u)).has(level.id); }
function authRequiredPage(level) { return '<div class="min-h-screen bg-[#F8F8FC] pb-20 text-[#1C1C28] overflow-x-hidden">' + teacherHeader() + '<section class="w-full px-6 md:px-10 pt-10 md:pt-16 max-w-xl mx-auto text-center"><div class="card-solid w-full overflow-hidden p-8 md:p-10"><div class="w-20 h-20 rounded-full bg-[#F4F2FF] text-[#6B48FF] flex items-center justify-center mx-auto mb-6 shadow-inner"><i class="fa-solid fa-lock text-3xl"></i></div><p class="text-[11px] md:text-[12px] font-bold tracking-[0.24em] uppercase text-gray-400 mb-3">Login Required</p><h1 class="text-[26px] md:text-[34px] font-extrabold text-[#2D2A4A] tracking-tight leading-tight">请先登录</h1><p class="mx-auto mt-4 max-w-[17rem] sm:max-w-md text-sm md:text-base leading-7 text-gray-500 font-medium break-words">' + esc(level?.title || '课程作业') + ' 需要登录后才能查看。</p><div class="mx-auto grid max-w-[17rem] grid-cols-1 sm:max-w-none sm:grid-cols-2 gap-3 mt-8"><button data-login class="w-full rounded-full bg-[#6B48FF] text-white py-4 text-sm font-bold shadow-md shadow-[#6B48FF]/25 active-scale">登录账号</button><button data-route="home" class="w-full rounded-full bg-[#F4F2FF] text-[#6B48FF] py-4 text-sm font-bold active-scale">返回首页</button></div></div></section></div>'; }
function card(level, i) { const meta = HOME_META[level.id] || HOME_META.a1; const u = currentUser(); const needsLogin = !u; const locked = needsLogin || (u && u.role === 'student' && !hasAccess(level)); const btn = locked ? 'bg-[#eef1f8] text-[#74777c] ring-1 ring-inset ring-[#d7dbea] shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]' : 'bg-[#5827fc] text-white shadow-[0_8px_20px_-4px_rgba(88,39,252,0.4)]'; const action = needsLogin ? 'data-login' : (locked ? 'data-toast="这个课程还没有开放给你"' : 'data-route="level" data-level="' + esc(level.id) + '"'); const label = needsLogin ? '<span class="material-symbols-outlined mr-1 text-[15px] leading-none">login</span>Login' : (locked ? '<span class="material-symbols-outlined mr-1 text-[15px] leading-none">lock</span>Locked' : 'Enter'); const size = level.title.length > 18 ? 'text-base leading-snug' : 'text-lg'; return '<button class="motion-list-item motion-card relative flex min-h-[12.75rem] flex-col items-center rounded-[1.75rem] bg-white p-5 text-center shadow-[0_12px_40px_-5px_rgba(92,45,255,0.08)] md:min-h-[14.5rem] md:rounded-[2rem] md:p-6" style="--motion-delay:' + (i*55) + 'ms" ' + action + '><div class="motion-icon flex h-16 w-16 items-center justify-center rounded-full ' + meta[2] + ' shadow-[inset_0_-4px_8px_rgba(0,0,0,0.08)] md:h-20 md:w-20"><span class="material-symbols-outlined text-4xl ' + meta[3] + '">' + meta[1] + '</span></div><div class="mt-4 flex flex-1 flex-col items-center justify-center"><h3 class="whitespace-pre-line font-bold text-[#2c2f33] ' + size + '">' + esc(level.title) + '</h3><p class="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#595b61]">' + esc(meta[0]) + '</p></div><span class="mt-4 inline-flex min-h-[40px] w-full items-center justify-center rounded-full px-4 py-2.5 text-center text-[12px] font-semibold tracking-[0.01em] ' + btn + '">' + label + '</span></button>'; }
function dotClass(i) { return 'rounded-full transition-all duration-200 ' + (i === state.slide ? 'h-1.5 w-6 bg-white' : 'h-1.5 w-1.5 bg-white/40'); }
function bannerTitleLines(title) { const lines = String(title || '').split(/\n|\|/).map(s => s.trim()).filter(Boolean); return lines.length ? lines.slice(0,3) : ['Xiaoyao Studio']; }
function bannerSlide(b) { return [b.tag || 'Studio News', bannerTitleLines(b.title), b.subtitle || b.description || '点击查看详情。', 'linear-gradient(135deg, rgba(88,39,252,0.78) 0%, rgba(161,146,255,0.68) 70%), url(' + b.image + ')', b.position || 'center', b.link || '', b.id || ('banner-' + b.title)]; }
function slideImageUrl(slide) { const match = String(slide && slide[3] || '').match(/url\((['"]?)(.*?)\1\)/); return match ? match[2] : ''; }
function visibleBanners() { return (state.banners || []).filter(b => b && b.image && b.title && b.status !== 'closed').sort((a,b) => (Number(a.sort_order) || 999) - (Number(b.sort_order) || 999)); }
function homeSlides() { const custom = visibleBanners().map(bannerSlide); return custom.length ? custom : SLIDES; }
function updateCarousel(nextIndex) { const slides = homeSlides(); if (!slides.length) return; state.slide = (nextIndex + slides.length) % slides.length; const track = document.querySelector('[data-carousel-track]'); if (track) track.style.transform = 'translateX(-' + (state.slide * (100 / slides.length)) + '%)'; document.querySelectorAll('[data-slide-index]').forEach((dot, i) => { dot.className = dotClass(i); dot.setAttribute('aria-pressed', String(i === state.slide)); }); }
function openCarouselSlide(index) { if (suppressCarouselClick) { suppressCarouselClick = false; return; } const slide = homeSlides()[index]; if (!slide) return; if (slide[6] === 'xiaoyao-radio-visit') return; if (slide[5]) location.assign(slide[5]); }
function accessDeniedPage(level) { return '<div class="min-h-screen bg-[#F8F8FC] pb-20 text-[#1C1C28] overflow-x-hidden">' + teacherHeader() + '<section class="w-full px-6 md:px-10 pt-10 md:pt-16 max-w-xl mx-auto text-center"><div class="card-solid w-full overflow-hidden p-8 md:p-10"><div class="w-20 h-20 rounded-full bg-[#F4F2FF] text-[#6B48FF] flex items-center justify-center mx-auto mb-6 shadow-inner"><i class="fa-solid fa-lock text-3xl"></i></div><p class="text-[11px] md:text-[12px] font-bold tracking-[0.24em] uppercase text-gray-400 mb-3">Course Locked</p><h1 class="text-[26px] md:text-[34px] font-extrabold text-[#2D2A4A] tracking-tight leading-tight">暂未开放</h1><p class="mx-auto mt-4 max-w-[17rem] sm:max-w-md text-sm md:text-base leading-7 text-gray-500 font-medium break-words">' + esc(level.title) + ' 还没有开放到当前账号，请联系老师开通课程权限。</p><div class="mx-auto grid max-w-[17rem] grid-cols-1 sm:max-w-none sm:grid-cols-2 gap-3 mt-8"><button data-route="home" class="w-full rounded-full bg-[#6B48FF] text-white py-4 text-sm font-bold shadow-md shadow-[#6B48FF]/25 active-scale">返回首页</button><button data-login class="w-full rounded-full bg-[#F4F2FF] text-[#6B48FF] py-4 text-sm font-bold active-scale">切换账号</button></div></div></section></div>'; }
function carousel() { const data = homeSlides(); if (state.slide >= data.length) state.slide = 0; const w = data.length * 100; const t = state.slide * (100 / data.length); const slides = data.map((s,i) => '<button class="relative flex aspect-[16/9] w-full shrink-0 cursor-pointer appearance-none items-start overflow-hidden border-0 p-7 text-left text-[#f6f0ff] sm:p-8 md:aspect-[21/8] md:p-10 lg:aspect-[3/1]" style="width:' + (100/data.length) + '%;background-color:#5827fc;background-image:' + esc(s[3]) + ';background-position:' + esc(s[4]) + ';background-repeat:no-repeat;background-size:cover" data-carousel-slide="' + i + '" aria-label="' + esc(s[1].join('，')) + '"><div class="relative z-10 max-w-[18.5rem] space-y-3 md:max-w-[20rem] md:space-y-4" style="margin-top:-0.45rem"><span class="inline-block rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">' + esc(s[0]) + '</span><h2 class="text-[clamp(1.08rem,5.2vw,1.5rem)] font-extrabold leading-[1.30] tracking-normal text-white md:text-2xl">' + s[1].map(line => '<span class="block whitespace-nowrap" style="' + (line.trim().startsWith('《') ? 'margin-left:-0.42em' : '') + '">' + esc(line) + '</span>').join('') + '</h2><p class="max-w-[285px] text-sm leading-5 text-white/90">' + esc(s[2]) + '</p></div></button>').join(''); const dots = data.map((_,i) => '<button data-slide-index="' + i + '" class="' + dotClass(i) + '" aria-label="切换到第 ' + (i + 1) + ' 张" aria-pressed="' + (i === state.slide) + '"></button>').join(''); return '<div class="motion-hero-enter motion-card relative mb-8 w-full rounded-[2.35rem] shadow-[0_18px_42px_-18px_rgba(88,39,252,0.34)] md:mb-10 md:rounded-[2.75rem]"><section data-carousel class="group relative w-full overflow-hidden rounded-[2.35rem] md:rounded-[2.75rem]" style="clip-path:inset(0 round clamp(2.35rem,4vw,2.75rem));touch-action:pan-y"><div data-carousel-track class="flex h-full transition-transform duration-500 ease-out" style="width:' + w + '%;transform:translateX(-' + t + '%)">' + slides + '</div><div class="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">' + dots + '</div></section></div>'; }
function homePage() { const u = currentUser(); const all = orderedLevels(); const visible = state.homeTab === 'hub' && u && u.role !== 'teacher' ? all.filter(hasAccess) : all; const login = state.homeTab === 'hub' && !u ? '<section class="motion-panel-enter mx-auto max-w-xl rounded-[1.75rem] bg-white p-6 text-center shadow-[0_12px_40px_-5px_rgba(92,45,255,0.08)]"><div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eff0f7] text-[#5827fc]"><span class="material-symbols-outlined text-[30px]">lock_open</span></div><h3 class="mt-4 text-xl font-bold text-[#2c2f33]">Login to open My Hub</h3><p class="mt-2 text-sm leading-6 text-[#595b61]">Sign in to see the course levels connected to this account.</p><button data-login class="motion-button mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#5827fc] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_10px_24px_-10px_rgba(88,39,252,0.52)]">Login</button></section>' : ''; const petPanel = state.homeTab === 'hub' && u && u.role !== 'teacher' ? '<div data-student-pet-panel class="mb-8">' + studentPetPanel() + '</div>' : ''; const grid = (state.homeTab === 'courses' || (state.homeTab === 'hub' && u)) ? '<section class="space-y-6 md:space-y-7"><div class="motion-panel-enter flex items-end justify-between px-2 md:px-1"><div><h2 class="text-2xl font-bold tracking-tight text-[#2c2f33] md:text-3xl">' + (state.homeTab === 'hub' ? 'My Courses' : 'All Courses') + '</h2><p class="text-sm text-[#595b61]">' + (state.homeTab === 'hub' ? 'Your available levels are shown here.' : 'View our full course collection here.') + '</p></div></div><div class="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4">' + visible.map(card).join('') + '</div></section>' : ''; return '<div class="home-viewport-frame text-[#2c2f33]"><div class="pointer-events-none absolute inset-0" style="background-color:#f5f6fc;background-image:radial-gradient(circle at top center,rgba(122,95,255,0.2) 0%,rgba(122,95,255,0.08) 18%,rgba(245,246,252,0) 42%),radial-gradient(circle at bottom center,rgba(140,118,255,0.12) 0%,rgba(245,246,252,0) 34%),linear-gradient(180deg,#fcfcff 0%,#f5f6fc 36%,#f4f5fc 100%)"></div>' + topNav(false,'Courses') + '<div class="home-shell-lock absolute inset-0 w-full overflow-hidden bg-transparent text-[#2c2f33]"><main class="home-dashboard-shell motion-page-enter absolute inset-x-0 mx-auto w-full max-w-[74rem] overflow-y-auto overflow-x-hidden px-4 no-scrollbar sm:px-6 lg:px-8" style="top:0;bottom:0;padding-top:var(--home-shell-top-offset,calc(5rem + 0.75rem));padding-bottom:calc(7.5rem + env(safe-area-inset-bottom,0px));overscroll-behavior-x:none;overscroll-behavior-y:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y">' + (state.homeTab === 'courses' ? carousel() : '') + login + petPanel + grid + '</main></div>' + bottomDock() + '</div>'; }
function levelModuleCard(item, index, meta, isTeacher) {
  const canOpen = item.isPublished || isTeacher;
  const attrs = canOpen ? 'data-open-lesson data-module-id="' + esc(item.id) + '" data-file="' + esc(item.file) + '"' : 'data-toast="这个单元暂未开放"';
  return '<button class="motion-list-item motion-card group relative flex w-full items-center gap-4 rounded-[1.75rem] p-5 text-left shadow-[0_12px_40px_-5px_rgba(92,45,255,0.08)] md:min-h-[12rem] md:flex-col md:items-start md:justify-between md:gap-5 md:rounded-[2rem] md:p-6 ' + (item.isPublished ? 'bg-white/92' : 'bg-[#FFECEE]') + '" style="--motion-delay:' + (index*55) + 'ms" ' + attrs + '><div class="motion-icon flex h-16 w-16 shrink-0 items-center justify-center rounded-full ' + meta[3] + ' shadow-[inset_0_-4px_8px_rgba(0,0,0,0.08)] md:h-14 md:w-14"><i class="fa-solid ' + item.icon + ' text-[1.35rem] ' + meta[4] + '"></i></div><div class="min-w-0 flex-1 pr-2 md:w-full md:flex-none md:pr-0"><h3 class="text-lg font-bold leading-tight text-[#2c2f33] md:text-xl">' + esc(item.title) + '</h3></div><div class="flex shrink-0 items-center md:w-full"><span class="inline-flex min-h-[40px] min-w-[5.5rem] items-center justify-center rounded-full bg-[#5827fc] px-4 py-2 text-[12px] font-semibold tracking-[0.01em] text-white shadow-[0_10px_24px_-10px_rgba(88,39,252,0.52)] md:w-full">Enter</span></div></button>';
}
function levelPage() {
  const level = levelById(state.level);
  if (!level) return homePage();
  const u = currentUser();
  const isTeacher = u && u.role === 'teacher';
  if (!u) return authRequiredPage(level);
  if (u && u.role === 'student' && !hasAccess(level)) return accessDeniedPage(level);
  const meta = LEVEL_META[level.id] || LEVEL_META.a1;
  const registryModules = modulesByLevel(level.id);
  const registryIds = new Set(registryModules.map(m => m.id));
  const registryItems = registryModules.map(m => {
    const db = homeworkById(m.id);
    if (db && db.status === 'deleted') return null;
    const status = db ? db.status : (m.isReady ? 'open' : 'closed');
    return { id:m.id, icon:m.icon, title:db && db.title ? db.title : m.title, file:db && db.file ? normalizeLessonFile(db.file) : normalizeLessonFile(m.localPath), unitCode:db && db.unit ? db.unit : (m.unitCode || ''), isPublished:status === 'open' };
  }).filter(Boolean);
  const uploadedItems = state.homework
    .filter(h => normalizeClass(h.classCode) === level.id && h.file && h.status !== 'deleted' && !registryIds.has(h.id))
    .map(h => ({ id:h.id, icon:'fa-file-code', title:h.title || h.id, file:normalizeLessonFile(h.file), unitCode:h.unit || 'Uploaded', isPublished:h.status === 'open' }));
  const items = registryItems.concat(uploadedItems).sort((a,b) => String(a.unitCode || '').localeCompare(String(b.unitCode || ''), undefined, { numeric:true, sensitivity:'base' }));
  const published = items.filter(item => item.isPublished);
  const hidden = items.filter(item => !item.isPublished);
  const primary = isTeacher ? (published.length ? published : hidden) : published;
  const secondary = isTeacher && published.length ? hidden : [];
  const unitGroups = (source) => {
    const map = new Map();
    source.forEach(item => {
      const key = item.unitCode || 'Unit';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });
    return Array.from(map.entries()).map(([unit, groupItems]) => ({ unit, items:groupItems }));
  };
  const primaryGroups = unitGroups(primary);
  const secondaryGroups = unitGroups(secondary);
  let cardIndex = 0;
  const renderUnitSections = groups => groups.map(group => {
    const cards = group.items.map(item => levelModuleCard(item, cardIndex++, meta, isTeacher)).join('');
    return '<section class="motion-panel-enter space-y-3"><div class="px-1"><span class="inline-flex min-h-[30px] items-center rounded-full bg-gray-100 px-3 py-1 text-[11px] font-extrabold text-gray-500 ring-1 ring-gray-200/70">' + esc(group.unit) + '</span></div><div class="grid gap-4 md:grid-cols-2 md:gap-5">' + cards + '</div></section>';
  }).join('');
  const list = '<section class="space-y-6">' + renderUnitSections(primaryGroups) + (secondaryGroups.length ? '<div class="space-y-6 pt-2">' + renderUnitSections(secondaryGroups) + '</div>' : '') + '</section>';
  return '<div class="level-viewport-frame text-[#2c2f33]"><div class="pointer-events-none absolute inset-0" style="background-color:#f5f6fc;background-image:radial-gradient(circle at top center,rgba(122,95,255,0.2) 0%,rgba(122,95,255,0.08) 18%,rgba(245,246,252,0) 42%),radial-gradient(circle at bottom center,rgba(140,118,255,0.12) 0%,rgba(245,246,252,0) 34%),linear-gradient(180deg,#fcfcff 0%,#f5f6fc 36%,#f4f5fc 100%)"></div>' + topNav(true, level.title) + '<div class="absolute inset-0 overflow-hidden text-[#2c2f33]"><main class="level-scroll-shell motion-page-enter absolute inset-x-0 mx-auto w-full max-w-[74rem] overflow-y-auto overflow-x-hidden px-4 no-scrollbar sm:px-6 lg:px-8" style="top:0;bottom:0;padding-top:var(--level-shell-top-offset,calc(5rem + 0.75rem));padding-bottom:calc(2.5rem + env(safe-area-inset-bottom,0px));overscroll-behavior-x:none;overscroll-behavior-y:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y"><section class="motion-hero-enter relative mb-8 overflow-hidden rounded-[2.2rem] bg-gradient-to-br ' + meta[2] + ' px-6 pb-8 pt-7 text-[#f6f0ff] shadow-[0_18px_44px_-16px_rgba(88,39,252,0.36)] md:mb-10 md:min-h-[15rem] md:rounded-[2.75rem] md:px-10 md:py-10 lg:min-h-[17rem]"><div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_32%)]"></div><div class="absolute right-[-0.2rem] top-[-0.45rem] md:right-8 md:top-1/2 md:-translate-y-1/2"><span class="motion-hero-symbol material-symbols-outlined text-[7.2rem] text-white opacity-30 md:text-[11rem] lg:text-[13rem]">' + meta[1] + '</span></div><div class="relative z-10"><div class="max-w-[calc(100%-4.75rem)] pr-16 sm:max-w-[18rem] sm:pr-0 md:max-w-[36rem]"><span class="block text-[10px] font-bold uppercase tracking-[0.24em] text-white/88 md:text-xs">' + meta[0] + '</span><h2 class="mt-4 whitespace-nowrap text-[clamp(1.55rem,8vw,2.25rem)] font-extrabold leading-[0.94] tracking-[-0.03em] text-white sm:text-[2.55rem]">' + esc(level.title) + '</h2></div></div></section>' + list + '</main></div></div>';
}
function teacherPage() {
  const u = currentUser();
  if (!u || u.role !== 'teacher') { setTimeout(showLogin,0); return homePage(); }
  const tabs = [['students','学生管理','fa-user-graduate'],['homework','作业管理','fa-book'],['banners','主页宣传','fa-image'],['attendance','考勤管理','fa-calendar-check'],['reports','报表','fa-chart-line'],['vote','选题管理','fa-square-poll-vertical'],['pets','宠物管理','fa-paw']];
  const tabBtns = tabs.map(t => {
    const active = state.teacherTab === t[0];
    return '<button data-teacher-tab="' + t[0] + '" class="shrink-0 rounded-full px-5 py-3.5 text-[14px] font-extrabold transition-all duration-200 shadow-sm flex items-center gap-2 active-scale md:shrink md:px-5 md:text-[14px] lg:px-6 ' + (active ? 'scale-[1.02] bg-[#6B48FF] text-white shadow-lg shadow-[#6B48FF]/30 ring-4 ring-[#6B48FF]/10' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50') + '"><i class="fa-solid ' + t[2] + '"></i><span class="whitespace-nowrap">' + t[1] + '</span>' + (active ? '<span class="ml-0.5 h-2 w-2 rounded-full bg-white/90 shadow-sm"></span>' : '') + '</button>';
  }).join('');
  return '<div class="min-h-screen bg-[#F8F8FC] pb-40 md:pb-44 text-[#1C1C28]">' + teacherHeader(false) + '<section class="px-4 sm:px-6 md:px-10 pt-4 mb-8 max-w-6xl mx-auto"><h1 class="text-[30px] md:text-[36px] font-extrabold text-[#2D2A4A] mb-2 tracking-tight">Teacher Admin</h1><p class="text-sm md:text-base text-gray-500 mb-6">工作室数据管理中心</p><div data-teacher-tabs class="flex gap-2.5 overflow-x-auto hide-scrollbar pb-5 mb-5 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-2 md:touch-auto lg:gap-3 touch-pan-x">' + tabBtns + '</div><div class="motion-panel-enter">' + teacherPanel() + '</div></section>' + teacherBottomNav() + '</div>';
}
function teacherHeader(showBack = false) {
  const u = currentUser();
  const left = showBack ? '<button data-route="home" class="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white text-[#6B48FF] flex items-center justify-center shadow-sm active-scale" aria-label="返回首页"><i class="fa-solid fa-arrow-left text-lg"></i></button>' : '<div class="min-w-0 flex items-center gap-2.5"><i class="fa-solid fa-graduation-cap shrink-0 text-[#6B48FF] text-3xl md:text-4xl"></i><span class="truncate font-extrabold text-[22px] md:text-[28px] tracking-tight text-[#2D2A4A]">Xiaoyao Studio</span></div>';
  const right = u ? '<div class="shrink-0 w-11 h-11 md:w-12 md:h-12"></div>' : '<button data-login class="shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#6B48FF] active-scale text-lg"><i class="fa-solid fa-user"></i></button>';
  return '<header class="px-6 md:px-10 py-5 md:py-6 flex justify-between items-center gap-4 sticky top-0 glass-header z-40 max-w-[1100px] mx-auto">' + left + right + '</header>';
}
function teacherBottomNav() {
  return '<nav class="motion-dock-enter fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[42rem] items-center justify-around rounded-t-[3rem] border-t border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.92)_36%,rgba(239,240,247,0.96)_100%)] px-4 py-3 backdrop-blur-[18px] shadow-[0_-12px_40px_-8px_rgba(92,45,255,0.12)] sm:w-[calc(100%_-_2rem)] md:bottom-5 md:rounded-full md:border" style="padding-bottom:calc(0.75rem + env(safe-area-inset-bottom,0px));background-color:rgba(239,240,247,0.94)"><button data-route="home" class="motion-tab flex min-h-[44px] flex-col items-center justify-center px-4 py-2 md:px-6 text-[#74777c]"><span class="material-symbols-outlined">home</span><span class="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em]">Home</span></button><button data-route="teacher" class="motion-tab flex min-h-[44px] flex-col items-center justify-center rounded-full bg-[#5c2dff] px-4 py-2 text-white shadow-[0_8px_20px_-4px_rgba(92,45,255,0.4)] md:px-6"><span class="material-symbols-outlined">dashboard_customize</span><span class="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em]">Teacher</span></button></nav>';
}
function teacherPanel() { if (state.teacherTab === 'students') return studentsPanel(); if (state.teacherTab === 'homework') return homeworkUploadPanel(); if (state.teacherTab === 'banners') return bannersPanel(); if (state.teacherTab === 'attendance') return attendancePanel(); if (state.teacherTab === 'reports') return reportsPanelV2(); if (state.teacherTab === 'vote') return voteResultsPanel(); if (state.teacherTab === 'pets') return petsPanel(); state.teacherTab = 'students'; return studentsPanel(); }
function teacherClasses() { return orderedLevels().map((l, i) => ({ code:l.id, name:l.title, icon:['fa-face-smile','fa-graduation-cap','fa-star','fa-trophy','fa-wand-magic-sparkles','fa-comments','fa-book-open','fa-user-tie','fa-newspaper'][i % 9] })); }
function moduleWithLevel(id) { for (const levelId of Object.keys(window.XY_CONTENT_MODULES)) { const m = modulesByLevel(levelId).find(x => x.id === id); if (m) return { module:m, levelId }; } return null; }
function lessonLevelId(id) { const found = moduleWithLevel(id); if (found) return normalizeClass(found.levelId); const hw = homeworkById(id); return hw ? normalizeClass(hw.classCode) : ''; }
function lessonAccess(id) { const u = currentUser(); if (!u) return { allowed:false, reason:'login' }; if (u.role === 'teacher') return { allowed:true, reason:'' }; const levelId = lessonLevelId(id); return { allowed:Boolean(levelId && classesOf(u).includes(levelId)), reason:levelId ? 'class' : 'unknown' }; }
function displayHomework() { const existing = new Map(state.homework.map(h => [h.id, { ...h, file:normalizeLessonFile(h.file) }])); allModules().forEach(m => { if (!existing.has(m.id)) { const found = moduleWithLevel(m.id); existing.set(m.id, { id:m.id, classCode:found ? found.levelId : '', unit:m.unitCode || 'Unit', title:m.title, file:normalizeLessonFile(m.localPath), status:m.isReady ? 'open' : 'closed' }); } }); return Array.from(existing.values()).filter(h => h.status !== 'deleted'); }
function captureHomeworkScroll() {
  const list = document.getElementById('homework-list-scroll');
  return { x:window.scrollX, y:window.scrollY, listTop:list ? list.scrollTop : 0 };
}
function restoreHomeworkScroll(pos) {
  if (!pos) return;
  const apply = () => {
    window.scrollTo(pos.x || 0, pos.y || 0);
    const list = document.getElementById('homework-list-scroll');
    if (list) list.scrollTop = pos.listTop || 0;
  };
  requestAnimationFrame(apply);
  setTimeout(apply, 60);
}
function homeworkFileState(file) {
  const raw = normalizeLessonFile(file);
  if (!raw) return ['未配置文件','text-gray-400','fa-circle-exclamation'];
  if (isAbsoluteUrl(raw)) return ['云端已同步','text-[#00BFA5]','fa-cloud-arrow-up'];
  return ['本地课程','text-gray-400','fa-folder'];
}
function studentsPanel() { const groups = teacherClasses().map(cls => { const list = state.students.filter(s => classesOf(s).includes(cls.code)); if (!list.length) return ''; const rows = list.map(s => '<div class="flex items-center justify-between gap-4 border-b border-gray-50 bg-white p-4 last:border-0"><div class="min-w-0"><p class="truncate text-[15px] font-bold text-[#2D2A4A] md:text-[16px]">' + esc(s.name) + '</p></div><div class="flex shrink-0 items-center gap-3"><button data-student-info="' + esc(s.id) + '" class="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4F2FF] text-[#6B48FF] shadow-sm transition-colors active-scale hover:bg-[#6B48FF] hover:text-white" aria-label="学生信息"><i class="fa-solid fa-circle-info text-sm"></i></button><button data-delete-student="' + esc(s.id) + '" data-student-name="' + esc(s.name) + '" class="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-sm transition-colors active-scale hover:bg-red-500 hover:text-white" aria-label="删除学生"><i class="fa-solid fa-trash-can text-sm"></i></button></div></div>').join(''); return '<details class="mb-3 overflow-hidden rounded-[1.35rem] border border-gray-100 bg-white shadow-sm"><summary class="flex cursor-pointer list-none items-center justify-between gap-4 bg-[#F4F2FF] px-5 py-4"><span class="flex min-w-0 items-center gap-3"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#6B48FF] shadow-sm"><i class="fa-solid ' + cls.icon + ' text-sm"></i></span><span class="min-w-0"><span class="block truncate text-sm font-extrabold text-[#2D2A4A]">' + esc(cls.name) + '</span><span class="mt-0.5 block text-xs font-bold text-[#6B48FF]/70">' + list.length + ' 名学生</span></span></span><i class="fa-solid fa-chevron-down text-xs text-[#6B48FF]"></i></summary><div>' + rows + '</div></details>'; }).join(''); const chips = teacherClasses().map(c => '<button type="button" data-toggle-chip="' + esc(c.code) + '" class="chip bg-[#F8F8FC] text-gray-500 text-[13px] md:text-[14px] px-4 py-2.5 rounded-xl active-scale">' + esc(c.name) + '</button>').join(''); return '<div class="tab-content active"><div class="mb-10"><h2 class="text-base md:text-lg font-extrabold text-[#2D2A4A] mb-5 pl-1">班级名单与进度概览</h2><div class="max-h-[500px] overflow-y-auto hide-scrollbar pb-5">' + (groups || '<p class="text-sm text-gray-400">暂无学生数据</p>') + '</div></div><h2 class="text-xl md:text-2xl font-extrabold text-[#2D2A4A] mb-4 pl-1">添加新学生</h2><div class="card-solid p-6 md:p-8 pb-10"><div class="md:grid md:grid-cols-2 md:gap-5"><div class="mb-5 md:mb-0"><label class="text-[11px] md:text-[13px] font-bold text-gray-400 uppercase ml-1 mb-2 block">ID (可修改)</label><input type="text" id="form-id" class="w-full bg-[#F8F8FC] border border-gray-200 rounded-xl px-5 py-4 text-base font-bold text-[#6B48FF] outline-none focus:border-[#6B48FF]"></div><div class="mb-5 md:mb-0"><label class="text-[11px] md:text-[13px] font-bold text-gray-400 uppercase ml-1 mb-2 flex justify-between">PWD <button type="button" data-regen-pwd class="fa-solid fa-rotate text-[#6B48FF] active-scale" aria-label="刷新密码"></button></label><input type="text" id="form-pwd" class="w-full bg-[#F8F8FC] border border-gray-200 rounded-xl px-5 py-4 text-base font-bold text-[#6B48FF] outline-none focus:border-[#6B48FF]"></div></div><div class="mb-5 mt-5"><label class="text-[11px] md:text-[13px] font-bold text-gray-400 uppercase ml-1 mb-2 block">Name</label><input type="text" id="form-name" placeholder="输入姓名" class="w-full bg-[#F8F8FC] border border-gray-200 rounded-xl px-5 py-4 text-base font-medium outline-none focus:border-[#6B48FF]"></div><div class="mb-8"><label class="text-[11px] md:text-[13px] font-bold text-gray-400 uppercase ml-1 mb-3 block">Assign Classes (多选)</label><div class="flex flex-wrap gap-2 md:gap-3" id="chip-container">' + chips + '</div></div><button data-save-student class="w-full bg-[#2D2A4A] text-white font-bold rounded-xl py-4 text-base shadow-lg active-scale" id="btn-register">直接添加至云端</button></div></div>'; }
function studentPetPanel() {
  const u = currentUser();
  if (!u || u.role !== 'student') return '';
  const cfg = petCfg();
  if (!cfg.loaded && !cfg.loading) setTimeout(() => loadPetData(false), 0);
  if (cfg.loading && !cfg.loaded) return '<section class="motion-panel-enter rounded-[1.75rem] bg-white p-6 text-center shadow-[0_12px_40px_-5px_rgba(92,45,255,0.08)]"><span class="material-symbols-outlined text-[42px] text-[#6B48FF]">sync</span><p class="mt-3 text-sm font-black text-[#74777c]">正在读取宠物档案...</p></section>';
  if (cfg.missing) return '<section class="motion-panel-enter rounded-[1.75rem] border border-dashed border-[#d8d4ff] bg-white/75 p-5 text-center text-sm font-bold text-[#74777c]">宠物模块还没有完成后端初始化。</section>';
  const pet = petForStudent(u.id);
  if (!pet) {
    const options = PET_TYPES.map((type, i) => '<button data-init-pet="' + type.id + '" class="motion-card rounded-[1.35rem] border border-white bg-gradient-to-br ' + type.tone + ' p-4 text-left shadow-[0_12px_30px_-18px_rgba(88,39,252,0.22)] active-scale"><span class="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-[#5c2dff] shadow-sm"><span class="material-symbols-outlined">' + type.icon + '</span></span><span class="mt-3 block text-base font-black text-[#2c2f33]">' + type.zh + '</span><span class="mt-1 block text-xs font-bold text-[#74777c]">' + (i === 0 ? '灵敏、热情，适合冲刺型学习节奏。' : '安静、稳定，适合长期积累型学习节奏。') + '</span></button>').join('');
    return '<section class="motion-panel-enter space-y-4 rounded-[1.9rem] bg-white p-5 shadow-[0_12px_40px_-5px_rgba(92,45,255,0.08)] md:p-6"><div><h2 class="text-2xl font-black text-[#2c2f33]">给你的成长伙伴起个名字</h2><p class="mt-2 text-sm font-semibold leading-6 text-[#74777c]">先写下名字，再选择小伙伴。完成课程后会自动获得经验和宠物积分。</p></div><label class="block"><span class="mb-2 ml-1 block text-xs font-black uppercase tracking-[0.16em] text-gray-400">宠物名字</span><input id="pet-name" value="" maxlength="24" placeholder="比如：小星星、Momo、Captain..." class="w-full rounded-2xl border border-[#e4e6ef] bg-[#f8f8fc] px-4 py-3 text-sm font-black text-[#2c2f33] outline-none transition focus:border-[#6B48FF] focus:bg-white"></label><div class="grid gap-3 sm:grid-cols-2">' + options + '</div>' + (cfg.error ? '<p class="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-500">' + esc(cfg.error) + '</p>' : '') + '</section>';
  }
  if (pet.is_visible === false) return '<section class="motion-panel-enter rounded-[1.75rem] bg-white p-6 text-center shadow-[0_12px_40px_-5px_rgba(92,45,255,0.08)]"><span class="material-symbols-outlined text-[42px] text-[#9ca3af]">visibility_off</span><h2 class="mt-3 text-xl font-black text-[#2c2f33]">宠物暂时隐藏</h2><p class="mt-2 text-sm font-semibold text-[#74777c]">老师后台开启后会重新显示。</p></section>';
  const info = petLevelInfo(pet);
  const type = petTypeMeta(pet.pet_type);
  const env = petEnvMeta(pet.environment_key);
  const owned = new Set(petInventoryFor(u.id));
  const asset = petAssetUrl(pet, info);
  const latest = petEventsFor(u.id, 1)[0];
  const remainingXp = info.nextXp ? Math.max(0, Number(info.nextXp) - Number(info.xp || 0)) : 0;
  const latestXp = latest ? signedPetDelta(latest.xp_delta) + ' EXP' : '--';
  const latestPoints = latest ? signedPetDelta(latest.point_delta) + ' 积分' : '--';
  const itemButtons = ['base'].concat(petItems().filter(i => i.active !== false).map(i => i.item_key)).map(key => {
    if (key === 'base') return '<button data-pet-equip="" class="' + petItemButtonClass(!pet.equipped_item) + '">原始</button>';
    const item = petItems().find(i => i.item_key === key);
    const has = owned.has(key);
    const active = pet.equipped_item === key;
    return '<button ' + (has ? 'data-pet-equip="' + esc(key) + '"' : 'data-pet-buy="' + esc(key) + '"') + ' class="' + petItemButtonClass(active) + '">' + esc(item?.label || key) + (has ? '' : ' · ' + Number(item?.price || 0)) + '</button>';
  }).join('');
  const envButtons = PET_ENVIRONMENTS.map(item => '<button data-pet-env="' + esc(item.id) + '" class="' + petEnvButtonClass(env.id === item.id) + '"><span class="material-symbols-outlined text-[16px]">' + item.icon + '</span>' + item.label + '</button>').join('') + '<button data-pet-env-demo="test" class="' + petEnvDemoButtonClass(false) + '"><span class="material-symbols-outlined text-[16px]">image</span>测试</button>';
  setTimeout(() => preloadPetWardrobe(pet), 0);
  return '<section class="motion-panel-enter overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_50px_-24px_rgba(92,45,255,0.22)]"><div data-pet-env-stage class="relative overflow-hidden bg-white px-5 pb-12 pt-5 md:px-7 md:pb-14 md:pt-7" style="background-image:' + petEnvironmentLayeredBackground(env.id) + ';background-size:cover;background-position:center"><div class="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-white/0 via-white/72 to-white"></div><div class="relative z-10 flex flex-col gap-5 md:flex-row md:items-stretch"><div class="flex min-w-0 flex-1 flex-col justify-between"><div><div class="flex flex-wrap items-center gap-2"><h2 class="text-[clamp(1.65rem,7vw,2.45rem)] font-black leading-tight tracking-tight text-[#2c2f33]">' + esc(pet.pet_name) + '</h2><span data-pet-kind-env class="rounded-full bg-white/55 px-3 py-1 text-[10px] font-black text-[#2D2A4A] backdrop-blur-sm">' + type.zh + ' · ' + env.label + '</span></div><p class="mt-2 text-sm font-bold leading-6 text-[#4b5563]">完成课程后自动成长。经验负责升级，积分用来解锁装扮。</p></div><div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3"><div class="rounded-[1.2rem] bg-white/68 p-3 backdrop-blur-sm"><p class="text-[10px] font-black uppercase tracking-[0.14em] text-gray-500">Level</p><p class="mt-1 text-2xl font-black text-[#6B48FF]">Lv.' + info.level + '</p></div><div class="rounded-[1.2rem] bg-white/68 p-3 backdrop-blur-sm"><p class="text-[10px] font-black uppercase tracking-[0.14em] text-gray-500">EXP</p><p class="mt-1 text-2xl font-black text-[#2D2A4A]">' + info.xp + '</p></div><div class="col-span-2 rounded-[1.2rem] bg-white/68 p-3 backdrop-blur-sm sm:col-span-1"><p class="text-[10px] font-black uppercase tracking-[0.14em] text-gray-500">积分</p><p data-pet-points-value class="mt-1 text-2xl font-black text-[#2D2A4A]">' + Number(pet.pet_points || 0) + '</p></div></div></div><div class="flex shrink-0 flex-col items-center justify-center md:w-[17rem]"><div class="pet-orbit-scene relative flex aspect-[16/10] w-64 max-w-full items-center justify-center md:w-72" style="--pet-accent:' + type.accent + '">' + petParticleNodes() + '<span class="pet-float"><img data-pet-image src="' + esc(asset) + '" alt="' + esc(pet.pet_name) + '" loading="lazy" onerror="this.style.display=&quot;none&quot;" class="p-2"><span class="pet-fallback-icon material-symbols-outlined text-[82px]" style="color:' + type.accent + '">' + type.icon + '</span></span></div><span data-pet-stage-text class="mt-2 rounded-full bg-white/70 px-4 py-2 text-xs font-black text-[#4b5563] backdrop-blur-sm">Stage ' + info.stage + '</span></div></div></div><div class="relative z-20 -mt-8 bg-white px-5 pb-5 pt-0 md:px-7"><div class="grid gap-4 md:grid-cols-[1.35fr_.85fr]"><div class="rounded-[1.35rem] bg-[#F8F8FC] p-4"><div class="flex items-center justify-between gap-3"><div><p class="text-xs font-black uppercase tracking-[0.18em] text-gray-400">成长进度</p><p class="mt-1 text-sm font-black text-[#2D2A4A]">' + (info.nextXp ? '距离 Lv.' + (info.level + 1) + ' 还差 ' + remainingXp + ' EXP' : '已经达到最高等级') + '</p></div><span class="rounded-full bg-white px-3 py-1.5 text-sm font-black text-[#6B48FF] shadow-sm">' + info.progress + '%</span></div><div class="mt-4 h-3 overflow-hidden rounded-full bg-white"><div class="h-full rounded-full bg-[#6B48FF] transition-all duration-300" style="width:' + info.progress + '%"></div></div></div><div class="rounded-[1.35rem] bg-[#F8F8FC] p-4"><p class="text-xs font-black uppercase tracking-[0.18em] text-gray-400">最近获得</p><div class="mt-3 flex flex-wrap gap-2"><span class="rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#6B48FF] shadow-sm">' + latestXp + '</span><span class="rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#2D2A4A] shadow-sm">' + latestPoints + '</span></div><p class="mt-2 line-clamp-2 text-xs font-bold leading-5 text-gray-400">' + (latest ? esc(latest.reason || '课程奖励已入账') : '完成一次课程后，这里会显示奖励。') + '</p></div></div><div class="mt-4 grid gap-4 md:grid-cols-2"><div class="min-w-0 rounded-[1.35rem] border border-gray-100 bg-white p-4"><p class="mb-3 text-xs font-black uppercase tracking-[0.18em] text-gray-400">环境</p><div class="flex flex-nowrap gap-2 overflow-x-auto pb-1 hide-scrollbar">' + envButtons + '</div></div><div class="min-w-0 rounded-[1.35rem] border border-gray-100 bg-white p-4"><p class="mb-3 text-xs font-black uppercase tracking-[0.18em] text-gray-400">装扮</p><div class="flex flex-nowrap gap-2 overflow-x-auto pb-1 hide-scrollbar">' + itemButtons + '</div></div>' + (cfg.error ? '<p class="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-500 md:col-span-2">' + esc(cfg.error) + '</p>' : '') + '</div></div></section>';
}
function petsPanel() {
  const cfg = petCfg();
  if (!cfg.loaded && !cfg.loading) setTimeout(() => loadPetData(false), 0);
  const pets = cfg.pets || [];
  const students = state.students.slice().sort((a,b) => String(a.name || a.id).localeCompare(String(b.name || b.id), 'zh-Hans'));
  const q = String(cfg.search || '').trim().toLowerCase();
  const filtered = students.filter(s => !q || String(s.name || '').toLowerCase().includes(q) || String(s.id || '').toLowerCase().includes(q));
  const stats = [
    ['学生总数', students.length, 'fa-user-graduate'],
    ['已创建宠物', pets.length, 'fa-paw'],
    ['可见宠物', pets.filter(p => p.is_visible !== false).length, 'fa-eye'],
    ['总积分', pets.reduce((s,p) => s + Number(p.pet_points || 0), 0), 'fa-coins']
  ].map(s => '<div class="rounded-[1.25rem] bg-[#F8F8FC] p-4"><p class="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400"><i class="fa-solid ' + s[2] + ' mr-2 text-[#6B48FF]"></i>' + s[0] + '</p><p class="mt-2 text-2xl font-black text-[#2D2A4A]">' + s[1] + '</p></div>').join('');
  const typeOpts = PET_TYPES.map(t => '<option value="' + t.id + '">' + t.zh + '</option>').join('');
  const studentCards = filtered.map((s, index) => {
    const p = petForStudent(s.id);
    const info = p ? petLevelInfo(p) : null;
    const levelOpts = petLevels().map(l => '<option value="' + l.level + '" ' + (p && Number(p.manual_level) === Number(l.level) ? 'selected' : '') + '>Lv.' + l.level + '</option>').join('');
    const open = String(cfg.activeStudentId || '') === String(s.id) || (!cfg.activeStudentId && index === 0) ? 'open ' : '';
    const status = p ? 'Lv.' + info.level + ' · ' + Number(p.pet_points || 0) + ' 积分' : '未创建';
    const body = p ? '<div class="space-y-4 p-4 md:p-5"><div class="grid gap-4 md:grid-cols-2"><label class="block"><span class="mb-2 ml-1 block text-xs font-black uppercase text-gray-400">宠物名</span><input data-pet-admin-name value="' + esc(p.pet_name) + '" class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-black outline-none"></label><label class="block"><span class="mb-2 ml-1 block text-xs font-black uppercase text-gray-400">显示</span><select data-pet-admin-visible class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-black outline-none"><option value="true" ' + (p.is_visible !== false ? 'selected' : '') + '>显示</option><option value="false" ' + (p.is_visible === false ? 'selected' : '') + '>隐藏</option></select></label><label class="block"><span class="mb-2 ml-1 block text-xs font-black uppercase text-gray-400">经验</span><input data-pet-admin-xp type="number" min="0" value="' + Number(p.experience_points || 0) + '" class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-black outline-none"></label><label class="block"><span class="mb-2 ml-1 block text-xs font-black uppercase text-gray-400">积分</span><input data-pet-admin-points type="number" min="0" value="' + Number(p.pet_points || 0) + '" class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-black outline-none"></label><label class="block"><span class="mb-2 ml-1 block text-xs font-black uppercase text-gray-400">等级模式</span><select data-pet-admin-level-mode class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-black outline-none"><option value="auto" ' + (p.level_mode !== 'manual' ? 'selected' : '') + '>自动</option><option value="manual" ' + (p.level_mode === 'manual' ? 'selected' : '') + '>手动</option></select></label><label class="block"><span class="mb-2 ml-1 block text-xs font-black uppercase text-gray-400">手动等级</span><select data-pet-admin-manual-level class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-black outline-none">' + levelOpts + '</select></label></div><button data-admin-save-pet="' + esc(s.id) + '" class="w-full rounded-xl bg-[#2D2A4A] py-4 text-sm font-black text-white active-scale">保存宠物档案</button><div class="rounded-[1.25rem] bg-[#F8F8FC] p-4"><p class="mb-3 text-sm font-black text-[#2D2A4A]">手动补偿</p><div class="grid gap-3 md:grid-cols-3"><input data-pet-adjust-xp type="number" placeholder="EXP +/-" class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-black outline-none"><input data-pet-adjust-points type="number" placeholder="积分 +/-" class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-black outline-none"><input data-pet-adjust-reason placeholder="原因" class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-black outline-none"></div><button data-admin-adjust-pet="' + esc(s.id) + '" class="mt-3 w-full rounded-xl bg-[#6B48FF] py-3 text-sm font-black text-white active-scale">应用补偿</button></div><p class="text-xs font-bold text-gray-400">当前 Lv.' + info.level + ' · Stage ' + info.stage + ' · 进度 ' + info.progress + '%</p></div>' : '<div class="p-4 md:p-5"><div class="rounded-[1.35rem] bg-[#F8F8FC] p-5"><p class="text-sm font-black text-[#2D2A4A]">' + esc(s.name || s.id) + ' 还没有宠物。</p><div class="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]"><input data-pet-create-name value="' + esc((s.name || 'Student') + ' Pet') + '" class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-black outline-none"><select data-pet-create-type class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-black outline-none">' + typeOpts + '</select><button data-admin-create-pet="' + esc(s.id) + '" class="rounded-xl bg-[#6B48FF] px-5 py-3 text-sm font-black text-white active-scale">创建</button></div></div></div>';
    return '<details ' + open + 'data-pet-student-panel="' + esc(s.id) + '" class="group overflow-hidden rounded-[1.35rem] border border-gray-100 bg-white shadow-sm"><summary class="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-4 bg-[#F8F8FC] px-5 py-4"><span class="flex min-w-0 items-center gap-3"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#6B48FF] shadow-sm"><i class="fa-solid fa-user-graduate text-sm"></i></span><span class="min-w-0"><span class="block truncate text-sm font-extrabold text-[#2D2A4A] md:text-base">' + esc(s.name || s.id) + '</span><span class="mt-0.5 block text-xs font-bold text-gray-400">' + esc(s.id) + '</span></span></span><span class="flex shrink-0 items-center gap-3"><span class="rounded-full bg-white px-3 py-1.5 text-[10px] font-black text-[#6B48FF] shadow-sm md:text-xs">' + status + '</span><i class="fa-solid fa-chevron-down text-xs text-[#6B48FF] transition-transform group-open:rotate-180"></i></span></summary>' + body + '</details>';
  }).join('');
  const fieldHint = (label, hint) => '<span class="mb-1 block text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">' + label + '</span><span class="mb-2 block text-[11px] font-bold leading-4 text-gray-400">' + hint + '</span>';
  const itemRows = petItems().map(item => '<div class="grid gap-3 rounded-[1rem] bg-[#F8F8FC] p-3 md:grid-cols-[minmax(9rem,1fr)_11rem_9rem_6rem] md:items-end"><p class="min-w-0 self-center font-black text-[#2D2A4A]">' + esc(item.label) + '</p><label class="block min-w-0">' + fieldHint('消耗积分', '学生购买会扣除') + '<input id="pet-item-price-' + esc(item.item_key) + '" type="number" min="0" value="' + Number(item.price || 0) + '" class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-black outline-none"></label><label class="block min-w-0">' + fieldHint('学生端状态', '是否可购买') + '<select id="pet-item-active-' + esc(item.item_key) + '" class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-black outline-none"><option value="true" ' + (item.active !== false ? 'selected' : '') + '>启用</option><option value="false" ' + (item.active === false ? 'selected' : '') + '>停用</option></select></label><button data-save-pet-item="' + esc(item.item_key) + '" class="min-h-[40px] rounded-xl bg-white px-4 py-2 text-xs font-black text-[#6B48FF] shadow-sm active-scale">保存</button></div>').join('');
  const levelRows = petLevels().map(level => '<div class="grid gap-3 rounded-[1rem] bg-[#F8F8FC] p-3 md:grid-cols-[minmax(9rem,1fr)_11rem_11rem_6rem] md:items-end"><p class="min-w-0 self-center font-black text-[#2D2A4A]">Lv.' + level.level + '</p><label class="block min-w-0">' + fieldHint('升级门槛 EXP', '累计达到后升级') + '<input id="pet-level-xp-' + level.level + '" type="number" min="0" value="' + Number(level.required_xp || 0) + '" class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-black outline-none"></label><label class="block min-w-0">' + fieldHint('图片阶段', '对应宠物形态') + '<input id="pet-level-stage-' + level.level + '" type="number" min="1" max="4" value="' + Number(level.stage || level.level) + '" class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-black outline-none"></label><button data-save-pet-level="' + level.level + '" class="min-h-[40px] rounded-xl bg-white px-4 py-2 text-xs font-black text-[#6B48FF] shadow-sm active-scale">保存</button></div>').join('');
  const rewardRows = petRewards().map(rule => '<div class="grid gap-3 rounded-[1rem] bg-[#F8F8FC] p-3 md:grid-cols-[minmax(9rem,1fr)_9rem_9rem_9rem_6rem] md:items-end"><p class="min-w-0 self-center font-black text-[#2D2A4A]">' + esc(rule.label) + '</p><label class="block min-w-0">' + fieldHint('触发分数 >=', '达到才发奖励') + '<input id="pet-reward-min-' + esc(rule.tier_key) + '" type="number" min="0" max="100" value="' + Number(rule.min_score || 0) + '" class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-black outline-none"></label><label class="block min-w-0">' + fieldHint('奖励 EXP', '用于宠物升级') + '<input id="pet-reward-xp-' + esc(rule.tier_key) + '" type="number" min="0" value="' + Number(rule.xp_reward || 0) + '" class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-black outline-none"></label><label class="block min-w-0">' + fieldHint('奖励积分', '用于购买装扮') + '<input id="pet-reward-points-' + esc(rule.tier_key) + '" type="number" min="0" value="' + Number(rule.point_reward || 0) + '" class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-black outline-none"></label><button data-save-pet-reward="' + esc(rule.tier_key) + '" class="min-h-[40px] rounded-xl bg-white px-4 py-2 text-xs font-black text-[#6B48FF] shadow-sm active-scale">保存</button></div>').join('');
  const eventRows = cfg.events.slice(0, 12).map(e => '<div class="flex items-start justify-between gap-4 rounded-[1rem] bg-[#F8F8FC] px-4 py-3"><div class="min-w-0"><p class="truncate text-sm font-black text-[#2D2A4A]">' + esc(state.students.find(s => String(s.id) === String(e.student_id))?.name || e.student_id) + '</p><p class="mt-1 text-xs font-bold text-gray-400">' + esc(e.reason || e.source_type || '宠物奖励') + '</p></div><span class="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-[#6B48FF]">' + signedPetDelta(e.xp_delta) + ' / ' + signedPetDelta(e.point_delta) + '</span></div>').join('');
  const ruleOpen = window.innerWidth >= 768 ? 'open ' : '';
  const ruleBlock = (title, icon, note, rows) => '<details ' + ruleOpen + 'class="group card-solid overflow-hidden"><summary class="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-4 bg-gradient-to-r from-[#F8F8FC] via-white to-[#F4F2FF] px-5 py-4 md:cursor-default md:px-6"><span class="flex min-w-0 items-center gap-3"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#6B48FF] shadow-sm"><i class="fa-solid ' + icon + ' text-sm"></i></span><span class="min-w-0"><span class="block truncate text-lg font-black text-[#2D2A4A]">' + title + '</span><span class="mt-1 block text-xs font-bold leading-5 text-gray-400">' + note + '</span></span></span><i class="fa-solid fa-chevron-down shrink-0 text-xs text-[#6B48FF] transition-transform group-open:rotate-180 md:hidden"></i></summary><div class="space-y-3 p-4 md:p-5">' + rows + '</div></details>';
  const rulesSection = '<section class="space-y-4">' + ruleBlock('装扮规则', 'fa-shirt', '价格表示学生购买该装扮需要消耗的宠物积分；状态控制是否在学生端开放购买。', itemRows) + ruleBlock('等级规则', 'fa-chart-simple', '所需经验表示达到该等级需要的累计 EXP；阶段对应宠物图片成长阶段。', levelRows) + ruleBlock('奖励规则', 'fa-gift', '最低分表示触发该档奖励的分数线；经验和积分分别是完成作业后发放给宠物的 EXP 与宠物积分。', rewardRows) + '</section>';
  return '<div class="tab-content active space-y-5 md:space-y-6"><section class="card-solid overflow-hidden"><div class="flex flex-col gap-4 border-b border-gray-100 bg-gradient-to-r from-[#F8F8FC] via-white to-[#F4F2FF] px-5 py-5 md:flex-row md:items-end md:justify-between md:px-6"><div><p class="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Pet Center</p><h2 class="mt-3 text-2xl font-black text-[#2D2A4A] md:text-3xl">宠物管理</h2></div><button data-pet-refresh class="inline-flex min-h-[40px] items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-black text-[#6B48FF] shadow-sm active-scale"><i class="fa-solid fa-rotate mr-2"></i>刷新</button></div>' + (cfg.error ? '<div class="mx-5 mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-500 md:mx-6">' + esc(cfg.error) + '</div>' : '') + '<div class="grid gap-3 px-5 py-5 md:grid-cols-4 md:px-6">' + stats + '</div></section><section class="card-solid overflow-hidden"><div class="flex flex-col gap-3 border-b border-gray-100 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6"><div><h3 class="text-lg font-black text-[#2D2A4A]">学生宠物</h3><p class="mt-1 text-xs font-bold text-gray-400">按学生展开后编辑宠物档案。</p></div><input data-pet-search value="' + esc(cfg.search || '') + '" placeholder="搜索学生" class="min-h-[42px] rounded-full border border-gray-200 bg-[#F8F8FC] px-4 py-2 text-sm font-black outline-none md:w-64"></div><div class="space-y-3 p-4 md:p-5">' + (studentCards || '<p class="rounded-[1.25rem] bg-[#F8F8FC] p-5 text-center text-sm font-bold text-gray-400">暂无学生</p>') + '</div></section>' + rulesSection + '<section class="card-solid p-5"><h3 class="mb-4 text-lg font-black text-[#2D2A4A]">最近奖励</h3><div class="grid gap-3 md:grid-cols-2">' + (eventRows || '<p class="rounded-[1.25rem] bg-[#F8F8FC] p-5 text-center text-sm font-bold text-gray-400">暂无宠物奖励记录。</p>') + '</div></section></div>';
}
function homeworkPanel() { const rows = displayHomework(); const openCount = rows.filter(h => h.status === 'open').length; const byClass = teacherClasses().map(cls => { const classHw = rows.filter(h => normalizeClass(h.classCode) === cls.code); if (!classHw.length) return ''; const units = [...new Set(classHw.map(h => h.unit || 'Unit'))]; const unitHtml = units.map(u => { const items = classHw.filter(h => (h.unit || 'Unit') === u).map(hw => '<div class="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 pl-5"><p class="text-[14px] md:text-[16px] font-bold text-[#2D2A4A] truncate pr-3">' + esc(hw.title) + '</p><div class="flex items-center gap-4 shrink-0"><label class="toggle"><input type="checkbox" ' + (hw.status === 'open' ? 'checked' : '') + ' data-toggle-lesson="' + esc(hw.id) + '"><span class="slider"></span></label><button data-delete-homework="' + esc(hw.id) + '" class="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center active-scale hover:bg-red-500 hover:text-white transition-colors shadow-sm"><i class="fa-solid fa-trash-can text-sm"></i></button></div></div>').join(''); return '<div class="mb-4"><div class="text-[12px] md:text-[14px] font-bold text-[#6B48FF] bg-[#F4F2FF] px-5 py-2 rounded-t-xl">' + esc(u) + '</div><div class="border border-t-0 border-[#F4F2FF] rounded-b-xl px-2 bg-white shadow-sm">' + items + '</div></div>'; }).join(''); return '<div class="mb-8"><h3 class="text-base md:text-lg font-extrabold text-[#2D2A4A] mb-3 pl-1"><i class="fa-solid ' + cls.icon + ' text-gray-400 mr-2 text-sm"></i> ' + esc(cls.name) + '</h3>' + unitHtml + '</div>'; }).join(''); const classOptions = teacherClasses().map(c => '<option value="' + esc(c.code) + '">' + esc(c.name) + '</option>').join(''); return '<div class="tab-content active"><div class="flex justify-between items-end mb-4 px-1"><h2 class="text-xl md:text-2xl font-extrabold text-[#2D2A4A]">在线大纲 (<span id="ui-hw-count" class="text-[#00BFA5]">' + openCount + '</span>)</h2><button data-close-old-hw class="text-sm font-bold text-red-500 bg-red-50 px-4 py-2 rounded-lg active-scale">一键关闭旧作业</button></div><div class="overflow-hidden mb-10 max-h-[500px] overflow-y-auto hide-scrollbar">' + (byClass || '<div class="card-solid p-6 text-center text-sm text-gray-400">暂无作业</div>') + '</div><h2 class="text-xl md:text-2xl font-extrabold text-[#2D2A4A] mb-4 pl-1">添加路径配置</h2><div class="card-solid p-6 md:p-8 pb-10"><div class="mb-5"><label class="text-[11px] md:text-[13px] font-bold text-gray-400 uppercase ml-1 mb-2 block">班级 (Class Code)</label><select id="hw-class" class="w-full bg-[#F8F8FC] border border-gray-200 rounded-xl px-5 py-4 text-base font-bold text-[#6B48FF] outline-none">' + classOptions + '</select></div><div class="md:grid md:grid-cols-2 md:gap-5 mb-5"><div class="mb-5 md:mb-0"><label class="text-[11px] md:text-[13px] font-bold text-gray-400 uppercase ml-1 mb-2 block">单元(Unit)</label><input type="text" id="hw-unit" placeholder="U1" class="w-full bg-[#F8F8FC] border border-gray-200 rounded-xl px-5 py-4 text-base font-medium outline-none"></div><div><label class="text-[11px] md:text-[13px] font-bold text-gray-400 uppercase ml-1 mb-2 block">标题(Title)</label><input type="text" id="hw-title" placeholder="Food & Drink" class="w-full bg-[#F8F8FC] border border-gray-200 rounded-xl px-5 py-4 text-base font-medium outline-none"></div></div><div class="mb-8"><label class="text-[11px] md:text-[13px] font-bold text-gray-400 uppercase ml-1 mb-2 block">课程文件路径（相对 classes/）</label><input type="text" id="hw-file" placeholder="lessons/a2-unit1-review.html" class="w-full bg-[#F8F8FC] border border-gray-200 rounded-xl px-5 py-4 text-base font-medium outline-none"></div><button id="btn-add-hw" data-add-homework class="w-full bg-[#00BFA5] text-white font-bold rounded-xl py-4 text-base shadow-lg active-scale">保存路径配置</button></div></div>'; }
function homeworkUploadPanel() {
  const rows = displayHomework();
  const openCount = rows.filter(h => h.status === 'open').length;
  const byClass = teacherClasses().map((cls, classIdx) => {
    const classHw = rows.filter(h => normalizeClass(h.classCode) === cls.code);
    if (!classHw.length) return '';
    const units = [...new Set(classHw.map(h => h.unit || 'Unit'))];
    const unitHtml = units.map(u => {
      const unitItems = classHw.filter(h => (h.unit || 'Unit') === u);
      const openUnitCount = unitItems.filter(h => h.status === 'open').length;
      const items = unitItems.map(hw => { const fileState = homeworkFileState(hw.file); return '<div class="flex items-center justify-between gap-4 border-b border-gray-50 py-3 pl-5 last:border-0"><div class="min-w-0"><p class="truncate pr-3 text-[14px] font-bold text-[#2D2A4A] md:text-[16px]">' + esc(hw.title) + '</p><p class="mt-1 truncate text-[11px] font-black ' + fileState[1] + '"><i class="fa-solid ' + fileState[2] + ' mr-1.5"></i>' + esc(fileState[0]) + '</p></div><div class="flex shrink-0 items-center gap-3"><button data-edit-homework="' + esc(hw.id) + '" class="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F2FF] text-[#6B48FF] shadow-sm transition-colors active-scale hover:bg-[#6B48FF] hover:text-white" aria-label="编辑课程"><i class="fa-solid fa-pen text-sm"></i></button><button data-delete-homework="' + esc(hw.id) + '" class="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-sm transition-colors active-scale hover:bg-red-500 hover:text-white" aria-label="删除课程"><i class="fa-solid fa-trash-can text-sm"></i></button><label class="toggle"><input type="checkbox" ' + (hw.status === 'open' ? 'checked' : '') + ' data-toggle-lesson="' + esc(hw.id) + '"><span class="slider"></span></label></div></div>'; }).join('');
      return '<div class="mb-4 overflow-hidden rounded-[1.25rem] border border-[#F4F2FF] bg-white shadow-sm"><div class="flex items-center justify-between gap-4 bg-[#F4F2FF] px-5 py-3"><span class="min-w-0"><span class="block truncate text-[13px] font-extrabold text-[#2D2A4A] md:text-[14px]">' + esc(u) + '</span><span class="mt-0.5 block text-[11px] font-bold text-[#6B48FF]/70">' + unitItems.length + ' 个课程 · ' + openUnitCount + ' 个开放</span></span></div><div class="px-2">' + items + '</div></div>';
    }).join('');
    const classOpenCount = classHw.filter(h => h.status === 'open').length;
    return '<details ' + (classIdx === 0 ? 'open ' : '') + 'class="group mb-4 overflow-hidden rounded-[1.35rem] border border-gray-100 bg-white shadow-sm"><summary class="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-4 bg-[#F4F2FF] px-5 py-4"><span class="flex min-w-0 items-center gap-3"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#6B48FF] shadow-sm"><i class="fa-solid ' + cls.icon + ' text-sm"></i></span><span class="min-w-0"><span class="block truncate text-sm font-extrabold text-[#2D2A4A] md:text-base">' + esc(cls.name) + '</span><span class="mt-0.5 block text-xs font-bold text-[#6B48FF]/70">' + classHw.length + ' 个课程 · ' + classOpenCount + ' 个开放 · ' + units.length + ' 个单元</span></span></span><i class="fa-solid fa-chevron-down shrink-0 text-xs text-[#6B48FF] transition-transform group-open:rotate-180"></i></summary><div class="bg-white p-3 pb-1">' + unitHtml + '</div></details>';
  }).join('');
  const classOptions = teacherClasses().map(c => '<option value="' + esc(c.code) + '">' + esc(c.name) + '</option>').join('');
  return '<div class="tab-content active"><div class="mb-4 flex flex-col gap-3 px-1 sm:flex-row sm:items-end sm:justify-between"><h2 class="text-xl font-extrabold text-[#2D2A4A] md:text-2xl">在线大纲 (<span id="ui-hw-count" class="text-[#00BFA5]">' + openCount + '</span>)</h2><div class="flex flex-wrap gap-2"><button id="btn-migrate-lessons" data-migrate-lessons class="rounded-lg bg-[#F4F2FF] px-4 py-2 text-sm font-bold text-[#6B48FF] active-scale">同步内置课程到后端</button><button data-close-old-hw class="rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-500 active-scale">一键关闭旧作业</button></div></div><div id="homework-list-scroll" class="mb-10 max-h-[500px] overflow-y-auto overflow-x-hidden hide-scrollbar">' + (byClass || '<div class="card-solid p-6 text-center text-sm text-gray-400">暂无作业</div>') + '</div><h2 class="mb-4 pl-1 text-xl font-extrabold text-[#2D2A4A] md:text-2xl">上传课程文件</h2><div class="card-solid p-6 pb-10 md:p-8"><div class="mb-5"><label class="mb-2 ml-1 block text-[11px] font-bold uppercase text-gray-400 md:text-[13px]">班级 (Class Code)</label><select id="hw-class" class="w-full rounded-xl border border-gray-200 bg-[#F8F8FC] px-5 py-4 text-base font-bold text-[#6B48FF] outline-none">' + classOptions + '</select></div><div class="mb-5 grid gap-5 md:grid-cols-2"><div><label class="mb-2 ml-1 block text-[11px] font-bold uppercase text-gray-400 md:text-[13px]">单元 (Unit)</label><input type="text" id="hw-unit" placeholder="U1" class="w-full rounded-xl border border-gray-200 bg-[#F8F8FC] px-5 py-4 text-base font-medium outline-none"></div><div><label class="mb-2 ml-1 block text-[11px] font-bold uppercase text-gray-400 md:text-[13px]">标题 (Title)</label><input type="text" id="hw-title" placeholder="Food & Drink" class="w-full rounded-xl border border-gray-200 bg-[#F8F8FC] px-5 py-4 text-base font-medium outline-none"></div></div><div class="mb-5"><label class="mb-2 ml-1 block text-[11px] font-bold uppercase text-gray-400 md:text-[13px]">上传 HTML 文件</label><input type="file" id="hw-upload" accept=".html,text/html" class="w-full rounded-xl border border-dashed border-[#C9C3FF] bg-[#F8F8FC] px-5 py-4 text-sm font-bold text-[#2D2A4A] file:mr-4 file:rounded-full file:border-0 file:bg-[#6B48FF] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"></div><div class="mb-8"><label class="mb-2 ml-1 block text-[11px] font-bold uppercase text-gray-400 md:text-[13px]">已有链接或本地路径（可选）</label><input type="text" id="hw-file" placeholder="https://... 或 lessons/a2-unit1-review.html" class="w-full rounded-xl border border-gray-200 bg-[#F8F8FC] px-5 py-4 text-base font-medium outline-none"><p class="mt-2 px-1 text-[12px] font-medium leading-5 text-gray-400">选择文件时会上传到 Supabase Storage：' + LESSON_UPLOAD_BUCKET + '。不选文件时，可保存一个已有公开链接或 classes/ 下的相对路径。</p></div><button id="btn-add-hw" data-add-homework class="w-full rounded-xl bg-[#00BFA5] py-4 text-base font-bold text-white shadow-lg active-scale">上传并发布课程</button></div></div>';
}
function defaultBannerList() { return SLIDES.map(s => '<div class="card-solid mb-4 flex items-center gap-4 p-4"><button data-preview-banner="' + esc(s[6]) + '" class="h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100 shadow-sm active-scale" aria-label="预览应急宣传图"><img src="' + esc(slideImageUrl(s)) + '" class="h-full w-full object-cover"></button><div class="min-w-0 flex-1"><p class="truncate text-[15px] font-bold text-[#2D2A4A] md:text-[16px]">' + esc(s[1].join(' ')) + '</p><p class="mt-1 truncate text-[11px] text-gray-400 md:text-[13px]">Tag: ' + esc(s[0]) + '</p><p class="mt-1 truncate text-[11px] font-bold text-[#6B48FF] md:text-[13px]">应急 fallback，仅在后端无可用卡片时显示</p></div><button data-preview-banner="' + esc(s[6]) + '" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4F2FF] text-[#6B48FF] shadow-sm transition-colors active-scale hover:bg-[#6B48FF] hover:text-white" aria-label="预览"><i class="fa-solid fa-eye text-sm"></i></button></div>').join(''); }
function bannerPositionOptions(value) {
  const current = value || 'center';
  const opts = [
    ['center','居中显示'],
    ['top','顶部对齐'],
    ['bottom','底部对齐'],
    ['left','左侧对齐'],
    ['right','右侧对齐'],
    ['50% 35%','人物偏上'],
    ['50% 65%','人物偏下'],
    ['30% 50%','主体偏左'],
    ['70% 50%','主体偏右']
  ];
  return opts.map(o => '<option value="' + esc(o[0]) + '" ' + (current === o[0] ? 'selected' : '') + '>' + esc(o[1]) + '</option>').join('');
}
function bannerRow(b) {
  const isOpen = b.status !== 'closed';
  const ordered = (state.banners || []).slice().sort((a,b) => (Number(a.sort_order) || 999) - (Number(b.sort_order) || 999));
  const page = Math.max(1, ordered.findIndex(item => String(item.id) === String(b.id)) + 1);
  const total = Math.max(1, ordered.length);
  return '<div data-banner-card="' + esc(b.id) + '" class="card-solid mb-5 overflow-hidden p-4 transition-all duration-200 md:p-5"><div class="flex flex-col gap-4 md:flex-row"><button data-preview-banner="' + esc(b.id) + '" class="h-40 w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm active-scale md:h-28 md:w-44 md:shrink-0" aria-label="预览宣传图"><img src="' + esc(b.image) + '" class="h-full w-full object-cover"></button><div class="min-w-0 flex-1"><div class="mb-2 flex flex-wrap items-center gap-2"><span class="rounded-full bg-gray-50 px-3 py-1.5 text-[10px] font-black text-gray-400">' + esc(b.tag || 'Studio News') + '</span></div><p class="line-clamp-2 text-[16px] font-black leading-6 text-[#2D2A4A] md:text-[18px]">' + esc(b.title) + '</p><p class="mt-2 line-clamp-2 text-[12px] font-medium leading-5 text-gray-400 md:text-[13px]">' + esc(b.subtitle || '点击查看详情。') + '</p><p class="mt-2 truncate text-[11px] font-bold text-gray-300">' + (b.link ? esc(b.link) : '无跳转链接') + '</p></div></div><div class="mt-4 rounded-2xl bg-[#F8F8FC] p-1.5 md:p-2"><div class="flex items-center justify-between gap-1 overflow-x-hidden md:gap-2"><label class="banner-switch ' + (isOpen ? 'is-open' : '') + '" aria-label="切换显示状态"><input type="checkbox" ' + (isOpen ? 'checked' : '') + ' data-toggle-banner="' + esc(b.id) + '"><span class="banner-switch-track"></span><span class="banner-switch-knob"></span><span class="banner-switch-text banner-switch-text-on">显示</span><span class="banner-switch-text banner-switch-text-off">隐藏</span></label><div class="flex h-9 w-[4.7rem] shrink-0 items-center justify-between rounded-full bg-white px-1 shadow-sm md:h-11 md:w-[8rem] md:px-2"><button data-banner-page-step="' + esc(b.id) + '" data-banner-page-delta="-1" class="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition active-scale hover:bg-[#F4F2FF] hover:text-[#6B48FF] md:h-8 md:w-8" aria-label="前移一页"><i class="fa-solid fa-minus text-[9px] md:text-[11px]"></i></button><span class="min-w-[1.55rem] text-center text-[11px] font-black text-[#6B48FF] md:min-w-[2rem] md:text-[12px]">' + page + '</span><button data-banner-page-step="' + esc(b.id) + '" data-banner-page-delta="1" class="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition active-scale hover:bg-[#F4F2FF] hover:text-[#6B48FF] md:h-8 md:w-8" aria-label="后移一页"><i class="fa-solid fa-plus text-[9px] md:text-[11px]"></i></button></div><span class="hidden rounded-full bg-white px-3 py-3 text-[11px] font-black text-gray-300 md:inline-flex">共 ' + total + ' 页</span><div class="flex shrink-0 gap-1 md:ml-auto md:gap-2"><button data-preview-banner="' + esc(b.id) + '" class="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#6B48FF] shadow-sm transition-colors active-scale hover:bg-[#6B48FF] hover:text-white md:h-11 md:w-11" aria-label="预览"><i class="fa-solid fa-eye text-[11px] md:text-sm"></i></button><button data-edit-banner="' + esc(b.id) + '" class="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#6B48FF] shadow-sm transition-colors active-scale hover:bg-[#6B48FF] hover:text-white md:h-11 md:w-11" aria-label="编辑"><i class="fa-solid fa-pen text-[11px] md:text-sm"></i></button><button data-delete-banner="' + esc(b.id) + '" class="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 transition-colors active-scale hover:bg-red-500 hover:text-white md:h-11 md:w-11" aria-label="删除"><i class="fa-solid fa-trash-can text-[11px] md:text-sm"></i></button></div></div></div></div>';
}
function bannerForm(prefix, b) {
  const item = b || { image:'', link:'', tag:'NEW', title:'', subtitle:'', position:'center', sort_order:(state.banners.length + 1), status:'open' };
  return '<div class="mb-6 rounded-2xl bg-[#F8F8FC] p-4"><label class="mb-2 ml-1 block text-[11px] font-bold uppercase text-gray-400 md:text-[13px]">上传图片到后端</label><input type="file" id="' + prefix + '-upload" accept="image/*" class="w-full rounded-xl border border-dashed border-[#C9C3FF] bg-white px-5 py-4 text-sm font-bold text-[#2D2A4A] file:mr-4 file:rounded-full file:border-0 file:bg-[#6B48FF] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"></div><div class="mb-6 grid gap-5 md:grid-cols-2"><div><label class="mb-2 ml-1 block text-[11px] font-bold uppercase text-gray-400 md:text-[13px]">图片直链</label><input type="url" id="' + prefix + '-img" value="' + esc(item.image) + '" placeholder="上传后端和直链二选一" class="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-base font-medium outline-none"></div><div><label class="mb-2 ml-1 block text-[11px] font-bold uppercase text-gray-400 md:text-[13px]">跳转网页链接</label><input type="url" id="' + prefix + '-link" value="' + esc(item.link || '') + '" placeholder="可留空" class="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-base font-medium outline-none"></div></div><div class="mb-6 grid gap-5 md:grid-cols-2"><div><label class="mb-2 ml-1 block text-[11px] font-bold uppercase text-gray-400 md:text-[13px]">标签</label><input type="text" id="' + prefix + '-tag" value="' + esc(item.tag || 'NEW') + '" class="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-base font-medium outline-none"></div><div><label class="mb-2 ml-1 block text-[11px] font-bold uppercase text-gray-400 md:text-[13px]">大标题</label><input type="text" id="' + prefix + '-title" value="' + esc(item.title || '') + '" placeholder="可用 | 或换行分成多行标题" class="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-base font-medium outline-none"></div></div><div class="mb-6"><label class="mb-2 ml-1 block text-[11px] font-bold uppercase text-gray-400 md:text-[13px]">副标题</label><input type="text" id="' + prefix + '-subtitle" value="' + esc(item.subtitle || '') + '" placeholder="点击查看详情。" class="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-base font-medium outline-none"></div><div class="mb-8 grid gap-5 md:grid-cols-2"><div><label class="mb-2 ml-1 block text-[11px] font-bold uppercase text-gray-400 md:text-[13px]">图片位置</label><select id="' + prefix + '-position" class="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-base font-bold text-[#6B48FF] outline-none">' + bannerPositionOptions(item.position) + '</select></div><div><label class="mb-2 ml-1 block text-[11px] font-bold uppercase text-gray-400 md:text-[13px]">状态</label><select id="' + prefix + '-status" class="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-base font-bold text-[#6B48FF] outline-none"><option value="open" ' + (item.status !== 'closed' ? 'selected' : '') + '>显示</option><option value="closed" ' + (item.status === 'closed' ? 'selected' : '') + '>隐藏</option></select></div></div>';
}
function bannersPanel() {
  const rows = (state.banners || []).slice().sort((a,b) => (Number(a.sort_order) || 999) - (Number(b.sort_order) || 999)).map(bannerRow).join('');
  const setup = state.bannerError ? '<div class="mb-3 rounded-2xl bg-red-50 px-4 py-3 text-[12px] font-bold leading-5 text-red-500">后端宣传表还没有初始化：请先在 Supabase SQL Editor 执行 xiaoyao1/supabase-banner-setup.sql。当前首页会继续使用前端应急 fallback。</div>' : '';
  const fallback = !rows ? '<div class="mb-3 rounded-2xl bg-[#F4F2FF] px-4 py-3 text-[12px] font-bold leading-5 text-[#6B48FF]">后端暂无主页宣传卡片。首页当前使用应急 fallback；完成 seed 后会自动改用后端内容。</div>' + defaultBannerList() : '';
  return '<div class="tab-content active space-y-5 md:space-y-6"><section class="card-solid overflow-hidden"><div class="flex flex-col gap-4 border-b border-gray-100 bg-gradient-to-r from-[#F8F8FC] via-white to-[#F4F2FF] px-5 py-5 md:flex-row md:items-end md:justify-between md:px-6"><div class="min-w-0"><p class="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Homepage Banners</p><h2 class="mt-3 text-2xl font-black text-[#2D2A4A] md:text-3xl">主页宣传</h2></div><a href="#banner-create-form" class="inline-flex min-h-[40px] items-center justify-center rounded-full bg-white px-4 py-2 text-[12px] font-black text-[#6B48FF] shadow-sm active-scale">新增卡片</a></div><div class="px-5 py-5 md:px-6"><p class="mb-4 text-[12px] font-bold text-gray-400">用每行的页数胶囊调整轮播顺序，首页会按页数从小到大展示</p><div class="max-h-[430px] overflow-y-auto hide-scrollbar">' + setup + (rows || fallback) + '</div></div></section><section id="banner-create-form" class="card-solid overflow-hidden bg-gradient-to-b from-white to-[#F8F8FC]"><div class="border-b border-gray-100 px-5 py-5 md:px-6"><p class="text-xs font-black uppercase tracking-[0.24em] text-gray-400">Create</p><h3 class="mt-2 text-xl font-black text-[#2D2A4A]">新增主页卡片</h3></div><div class="p-6 pb-10 md:p-8">' + bannerForm('ban') + '<button id="btn-add-ban" data-add-banner class="w-full rounded-xl bg-[#6B48FF] py-4 text-base font-bold text-white shadow-lg shadow-[#6B48FF]/30 active-scale">新增并发布到主页轮播</button></div></section></div>';
}
const REPORT_COLORS = ['#6B48FF','#00BFA5','#FF4B72','#FFB800','#3949AB'];
const REPORT_BUCKETS = [{ label:'90-100', min:90, max:100, color:'#059669' },{ label:'80-89', min:80, max:89, color:'#0284c7' },{ label:'60-79', min:60, max:79, color:'#d97706' },{ label:'<60', min:0, max:59, color:'#e11d48' }];
function dateInputValue(date) { const d = new Date(date); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function datetimeInputValue(date) { const d = new Date(date); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0') + 'T' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0'); }
function reportBoundary(value, isEnd) { if (!value) return null; const text = String(value); const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(text) ? text + (isEnd ? 'T23:59:59' : 'T00:00:00') : text); return Number.isNaN(d.getTime()) ? null : d; }
function reportDefaults() { const end = new Date(); const start = new Date(); start.setDate(start.getDate() - 29); return { startDate:datetimeInputValue(start), endDate:datetimeInputValue(end), selectedLevelId:'all', selectedLessonId:'all', sourceFilter:'all', viewMode:'student', selectedComparisonIds:[], quizAttempts:[], diagnosticAttempts:[], loading:false, loaded:false, error:'' }; }
function reportCfg() { if (!state.report) state.report = reportDefaults(); if (/^\d{4}-\d{2}-\d{2}$/.test(state.report.startDate || '')) state.report.startDate += 'T00:00'; if (/^\d{4}-\d{2}-\d{2}$/.test(state.report.endDate || '')) state.report.endDate += 'T23:59'; state.report.sourceFilter = 'all'; return state.report; }
function reportDateKeys(startValue, endValue) { const start = reportBoundary(startValue, false); const end = reportBoundary(endValue, true); if (!start || !end || start > end) return []; const keys = []; const cursor = new Date(start); cursor.setHours(0,0,0,0); while (cursor <= end) { keys.push(dateInputValue(cursor)); cursor.setDate(cursor.getDate()+1); } return keys; }
function reportAverage(values) { const valid = values.filter(v => Number.isFinite(v)); return valid.length ? Math.round(valid.reduce((a,b) => a + b, 0) / valid.length) : 0; }
function reportScore(correct, total, explicit) { const t = Number(total) || 0; if (t > 0 && Number.isFinite(Number(correct))) return Math.round(((Number(correct) || 0) / t) * 100); const n = Number(explicit); return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0; }
function reportMetric(row, key) { const meta = row && typeof row.metadata === 'object' && row.metadata ? row.metadata : {}; const camel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()); const legacy = meta.legacyPayload && typeof meta.legacyPayload === 'object' ? meta.legacyPayload : {}; const metrics = meta.metrics && typeof meta.metrics === 'object' ? meta.metrics : {}; const value = row?.[key] ?? row?.[camel] ?? meta[key] ?? meta[camel] ?? metrics[key] ?? metrics[camel] ?? legacy[key] ?? legacy[camel]; const n = Number(value); return Number.isFinite(n) ? n : null; }
function reportDateTime(value) { if (!value) return '--'; try { return new Intl.DateTimeFormat('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value)); } catch { return '--'; } }
function attendanceDefaults() { const today = dateInputValue(new Date()); return { classCode:teacherClasses()[0]?.code || 'f2', startDate:today, endDate:today, note:'事假', selectedIds:[], records:[], submissions:[], loading:false, loaded:false, error:'' }; }
function attendanceCfg() { const base = attendanceDefaults(); if (!state.attendance) state.attendance = base; else Object.keys(base).forEach(key => { if (state.attendance[key] === undefined) state.attendance[key] = base[key]; }); state.attendance.records = state.attendance.records || []; state.attendance.submissions = state.attendance.submissions || []; state.attendance.selectedIds = state.attendance.selectedIds || []; if (!state.attendance.note) state.attendance.note = '事假'; return state.attendance; }
function attendanceInputClass() { return 'w-full rounded-2xl border border-gray-200 bg-[#F8F8FC] px-4 py-3 text-sm font-black text-[#2D2A4A] outline-none transition focus:border-[#6B48FF]'; }
function attendanceField(label, html) { return '<label><span class="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-gray-400">' + label + '</span>' + html + '</label>'; }
function attendanceBoundary(value, isEnd = false) { if (!value) return null; const text = String(value); const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(text) ? text + (isEnd ? 'T23:59:59' : 'T00:00:00') : text); if (Number.isNaN(d.getTime())) return null; if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) d.setHours(isEnd ? 23 : 0, isEnd ? 59 : 0, isEnd ? 59 : 0, isEnd ? 999 : 0); return d; }
function attendanceDateTime(value) { if (!value) return '--'; try { return new Intl.DateTimeFormat('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value)); } catch { return '--'; } }
function attendanceClassStudents(classCode) { return state.students.filter(s => classesOf(s).includes(classCode)).sort((a,b) => String(a.name || a.id).localeCompare(String(b.name || b.id), 'zh-CN')); }
function attendanceStudentName(id) { return state.students.find(s => String(s.id) === String(id))?.name || ''; }
function attendanceStatusMeta(status) { return ATTENDANCE_STATUS.find(s => s[0] === status) || ATTENDANCE_STATUS[0]; }
function statusCountMap(records) { return (records || []).reduce((map, r) => { map[r.status] = (map[r.status] || 0) + 1; return map; }, {}); }
function attendancePayloadStudentRows() { const cfg = attendanceCfg(); const students = attendanceClassStudents(cfg.classCode); const selected = new Set(cfg.selectedIds || []); return students.filter(s => selected.has(String(s.id))); }
function submissionStudentId(row) { return String(row.student_id || row.studentId || '').trim(); }
function submissionHomeworkId(row) { return String(row.homework_id || row.lesson_id || row.module_id || row.moduleId || '').trim(); }
function attendanceSubmissionsInRange(rows, start, end) {
  return (rows || []).filter(row => {
    const id = submissionStudentId(row);
    const d = new Date(row.created_at || row.submitted_at || row.date || '');
    return id && !isExemptLessonId(submissionHomeworkId(row)) && !Number.isNaN(d.getTime()) && d >= start && d <= end;
  });
}
function attendanceSubmissionMap(rows) {
  const map = new Map();
  const modules = reportModuleMap();
  const levelLabel = id => ({ f2:'F2', a1:'A1', 'a1-plus':'A1+', a2:'A2', 'a2-plus':'A2+', swsy:'SWSY', 'junior-ability':'Junior', economist:'Economist', others:'Others' }[normalizeClass(id)] || String(id || '未分类').toUpperCase());
  (rows || []).forEach(row => {
    const id = submissionStudentId(row);
    if (!id) return;
    const lessonId = submissionHomeworkId(row);
    const meta = modules.get(lessonId);
    const label = levelLabel(meta?.levelId || row.class_code || '');
    const current = map.get(id) || { latest:null, titles:[] };
    const at = new Date(row.created_at || row.submitted_at || row.date || 0).getTime();
    const currentAt = current.latest ? new Date(current.latest.created_at || current.latest.submitted_at || current.latest.date || 0).getTime() : -1;
    if (label && !current.titles.includes(label)) current.titles.push(label);
    if (!current.latest || at > currentAt) current.latest = row;
    map.set(id, current);
  });
  return map;
}
function attendanceExemptionMap(records) {
  const map = new Map();
  (records || []).forEach(row => {
    const id = String(row.student_id || '').trim();
    const note = String(row.note || '');
    if (!id || row.status !== 'present' || note.includes('自动判定')) return;
    const current = map.get(id);
    const at = new Date(row.created_at || row.updated_at || row.start_at || 0).getTime();
    const currentAt = current ? new Date(current.created_at || current.updated_at || current.start_at || 0).getTime() : -1;
    if (!current || at > currentAt) map.set(id, row);
  });
  return map;
}
function withTimeout(promise, ms, message) { return Promise.race([promise, new Promise(resolve => setTimeout(() => resolve({ error:{ message } }), ms))]); }
function reportFullDate(key) { const parts = String(key).split('-'); return Number(parts[1] || 1) + '月' + Number(parts[2] || 1) + '日'; }
function reportShortDate(key) { const parts = String(key).split('-'); return Number(parts[1] || 1) + '.' + Number(parts[2] || 1); }
function reportModuleMap() { const map = new Map(); orderedLevels().forEach(level => modulesByLevel(level.id).forEach(m => map.set(m.id, { id:m.id, levelId:level.id, levelTitle:level.title, title:m.title, unit:m.unitCode || m.unit || '' }))); displayHomework().forEach(h => map.set(h.id, { id:h.id, levelId:normalizeClass(h.classCode), levelTitle:levelById(normalizeClass(h.classCode))?.title || h.classCode, title:h.title, unit:h.unit || '' })); return map; }
function reportClassLabel(code) { const c = teacherClasses().find(item => item.code === normalizeClass(code)); return c ? c.name : (code || '未分班'); }
function reportStudentMap() { return new Map(state.students.map(s => [s.id, s])); }
function reportRecordQuality(record) { let score = 0; if (Number.isFinite(Number(record.correctCount)) && Number.isFinite(Number(record.totalCount)) && Number(record.totalCount) > 0) score += 4; if (Number(record.reportConfidence || 0) >= 2) score += 2; if (record.source === 'quiz' || record.source === 'diagnostic') score += 2; return score; }
function isUnverifiedObserverReport(record) { return record.source === 'lesson' && record.reportNote === 'result-observer' && Number(record.reportConfidence || 0) < 2 && reportRecordQuality(record) === 0; }
function isNewerReport(a, b) { if (!b) return true; const qa = reportRecordQuality(a); const qb = reportRecordQuality(b); if (qa !== qb) return qa > qb; return new Date(a.submittedAt).getTime() > new Date(b.submittedAt).getTime(); }
function isExemptLessonId(id) { return String(id || '').startsWith('EXEMP_'); }
function reportEntityId(record, viewMode) { return viewMode === 'class' ? 'class:' + (record.className || '未分班') : record.studentId; }
function reportEntityLabel(record, viewMode) { return viewMode === 'class' ? (record.className || '未分班') : record.studentName; }
function reportLessonOptions(cfg, records) { const map = reportModuleMap(); const ids = new Set(records.map(r => r.lessonId).filter(Boolean)); map.forEach((meta, id) => { if (cfg.selectedLevelId === 'all' || meta.levelId === cfg.selectedLevelId) ids.add(id); }); return Array.from(ids).map(id => { const meta = map.get(id); return { id, title:meta?.title || id, levelId:meta?.levelId || '' }; }).filter(item => cfg.selectedLevelId === 'all' || item.levelId === cfg.selectedLevelId || !item.levelId).sort((a,b) => a.title.localeCompare(b.title)); }
function reportLessonId(row) { const meta = row && typeof row.metadata === 'object' && row.metadata ? row.metadata : {}; const legacy = meta.legacyPayload && typeof meta.legacyPayload === 'object' ? meta.legacyPayload : {}; return row.homework_id || row.lesson_id || row.module_id || row.moduleId || legacy.homework_id || legacy.homeworkId || legacy.module_id || legacy.moduleId || ''; }
function rawReportRecords() { const students = reportStudentMap(); const modules = reportModuleMap(); const cfg = reportCfg(); const start = reportBoundary(cfg.startDate, false); const end = reportBoundary(cfg.endDate, true); if (!start || !end) return []; const make = (row) => { const studentId = row.student_id || row.studentId; const lessonId = reportLessonId(row); const student = students.get(studentId); const meta = modules.get(lessonId); const rowMeta = row && typeof row.metadata === 'object' && row.metadata ? row.metadata : {}; const classes = classesOf(student); const submittedAt = row.submitted_at || row.created_at || row.date || new Date().toISOString(); const correct = reportMetric(row, 'correct_count'); const total = reportMetric(row, 'total_count'); const score = reportScore(correct, total, row.score); const source = row.source === 'quiz' ? 'quiz' : row.source === 'diagnostic' ? 'diagnostic' : (String(row.event_type || '').includes('quiz') ? 'quiz' : String(row.event_type || '').includes('diagnostic') ? 'diagnostic' : 'lesson'); const confidence = Number(rowMeta.metrics && rowMeta.metrics.confidence || 0); return { id:source + ':' + (row.id || studentId + ':' + lessonId + ':' + submittedAt), source, sourceLabel:source === 'quiz' ? '测验' : source === 'diagnostic' ? '诊断' : '练习', studentId, studentName:student?.name || studentId || '未命名学生', className:classes.length ? classes.map(reportClassLabel).join(' / ') : '未分班', lessonId, moduleTitle:meta?.title || row.module_title || lessonId || '未命名单元', levelId:meta?.levelId || normalizeClass(row.class_code || ''), levelCode:meta?.levelTitle || reportClassLabel(row.class_code || ''), submittedAt, correctCount:correct ?? null, totalCount:total ?? null, scorePercent:score, reportConfidence:confidence, reportNote:String(rowMeta.text || rowMeta.triggerText || '') }; }; return state.logs.map(make).filter(record => { const d = new Date(record.submittedAt); return record.studentId && record.lessonId && !isExemptLessonId(record.lessonId) && d >= start && d <= end; }); }
function computeReports() { const cfg = reportCfg(); const records = rawReportRecords().filter(record => !isUnverifiedObserverReport(record) && (cfg.sourceFilter === 'all' || record.source === cfg.sourceFilter) && (cfg.selectedLevelId === 'all' || record.levelId === cfg.selectedLevelId) && (cfg.selectedLessonId === 'all' || record.lessonId === cfg.selectedLessonId)); const latest = new Map(); records.forEach(record => { const key = record.studentId + ':' + record.lessonId; if (isNewerReport(record, latest.get(key))) latest.set(key, record); }); const latestRows = Array.from(latest.values()).sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt)); const summary = new Map(); latestRows.forEach(record => { const id = reportEntityId(record, cfg.viewMode); if (!summary.has(id)) summary.set(id, { id, label:reportEntityLabel(record, cfg.viewMode), studentIds:new Set(), lessonIds:new Set(), scores:[], latestSubmittedAt:null, latestRecord:null }); const row = summary.get(id); row.studentIds.add(record.studentId); row.lessonIds.add(record.lessonId); row.scores.push(record.scorePercent); if (isNewerReport(record, row.latestRecord)) { row.latestRecord = record; row.latestSubmittedAt = record.submittedAt; } }); const submitCounts = new Map(); latestRows.forEach(record => { const id = reportEntityId(record, cfg.viewMode); submitCounts.set(id, (submitCounts.get(id) || 0) + 1); }); const summaryRows = Array.from(summary.values()).map(row => ({ ...row, averageScore:reportAverage(row.scores), studentCount:row.studentIds.size, unitCount:row.lessonIds.size, submitCount:submitCounts.get(row.id) || 0 })).sort((a,b) => b.averageScore - a.averageScore || new Date(b.latestSubmittedAt || 0) - new Date(a.latestSubmittedAt || 0)); const comparisonOptions = Array.from(new Map(latestRows.map(r => [reportEntityId(r, cfg.viewMode), { id:reportEntityId(r, cfg.viewMode), label:reportEntityLabel(r, cfg.viewMode) }])).values()).sort((a,b) => a.label.localeCompare(b.label)); const selected = cfg.selectedComparisonIds.length ? cfg.selectedComparisonIds.filter(id => comparisonOptions.some(o => o.id === id)) : comparisonOptions.slice(0,3).map(o => o.id); const keys = reportDateKeys(cfg.startDate, cfg.endDate); const chart = selected.map((id, idx) => { const daily = new Map(keys.map(k => [k, []])); latestRows.forEach(record => { if (reportEntityId(record, cfg.viewMode) !== id) return; const key = dateInputValue(record.submittedAt); if (daily.has(key)) daily.get(key).push(record.scorePercent); }); const values = keys.map(key => { const scores = daily.get(key) || []; return scores.length ? reportAverage(scores) : null; }); return { id, label:comparisonOptions.find(o => o.id === id)?.label || id, color:REPORT_COLORS[idx % REPORT_COLORS.length], values }; }).filter(series => series.values.some(v => v !== null)); const buckets = REPORT_BUCKETS.map(bucket => ({ ...bucket, count:latestRows.filter(r => r.scorePercent >= bucket.min && r.scorePercent <= bucket.max).length })); const studentCount = new Set(latestRows.map(r => r.studentId)).size; const classCount = new Set(latestRows.map(r => r.className)).size; return { records, latestRows, summaryRows, comparisonOptions, selected, keys, chart, buckets, stats:{ studentCount, classCount, submitCount:latestRows.length, averageScore:reportAverage(latestRows.map(r => r.scorePercent)) }, lessons:reportLessonOptions(cfg, rawReportRecords()) }; }
function reportPieBackground(buckets) { const total = buckets.reduce((s,b) => s + b.count, 0); if (!total) return 'conic-gradient(#e2e8f0 0deg 360deg)'; let cursor = 0; return 'conic-gradient(' + buckets.map(b => { const start = cursor; const end = cursor + b.count / total * 360; cursor = end; return b.color + ' ' + start + 'deg ' + end + 'deg'; }).join(',') + ')'; }
function reportTrendSvg(data) { if (!data.chart.length) return '<div class="rounded-[1.4rem] border border-dashed border-gray-200 bg-[#F8F8FC] px-5 py-8 text-center text-sm font-bold text-gray-400">暂无趋势数据。</div>'; const w = 720, h = 260, pad = { left:42, right:24, top:26, bottom:38 }; const point = (i, val, count) => { const iw = w - pad.left - pad.right; const ih = h - pad.top - pad.bottom; return { x:pad.left + (iw / ((count - 1) || 1)) * i, y:pad.top + ih - (Math.max(0, Math.min(100, val)) / 100) * ih }; }; const grid = [100,75,50,25,0].map(level => { const p = point(0, level, 2); return '<g><line x1="' + pad.left + '" x2="' + (w-pad.right) + '" y1="' + p.y + '" y2="' + p.y + '" stroke="#e2e8f0" stroke-dasharray="4 6"></line><text x="8" y="' + (p.y+4) + '" fill="#94a3b8" font-size="11" font-weight="900">' + level + '%</text></g>'; }).join(''); const dates = data.keys.map((key,i,arr) => { const p = point(i,0,arr.length); const show = arr.length <= 10 || i === 0 || i === arr.length - 1 || i % Math.ceil(arr.length/6) === 0; return '<g><line x1="' + p.x + '" x2="' + p.x + '" y1="' + pad.top + '" y2="' + (h-pad.bottom) + '" stroke="#f1f5f9"></line>' + (show ? '<text x="' + p.x + '" y="' + (h-12) + '" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="900">' + reportShortDate(key) + '</text>' : '') + '</g>'; }).join(''); const lines = data.chart.map(series => { const pts = series.values.map((v,i) => v === null ? null : point(i,v,series.values.length)); const path = pts.map((p,i) => p ? (i === 0 || !pts.slice(0,i).some(Boolean) ? 'M ' : 'L ') + p.x + ' ' + p.y : '').filter(Boolean).join(' '); const circles = pts.map((p,i) => p ? '<circle cx="' + p.x + '" cy="' + p.y + '" r="4.5" fill="' + series.color + '" stroke="#fff" stroke-width="2.5"><title>' + esc(series.label + ' ' + reportFullDate(data.keys[i]) + ' ' + series.values[i] + '%') + '</title></circle>' : '').join(''); return '<g><path d="' + path + '" fill="none" stroke="' + series.color + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>' + circles + '</g>'; }).join(''); const legend = data.chart.map(s => '<div class="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-gray-600 shadow-sm"><span class="h-2.5 w-2.5 rounded-full" style="background:' + s.color + '"></span>' + esc(s.label) + '</div>').join(''); return '<div class="rounded-[1.35rem] border border-gray-200 bg-[#F8F8FC] p-3 md:p-5"><svg viewBox="0 0 720 260" class="h-auto w-full overflow-visible" role="img" aria-label="成绩趋势折线图">' + grid + dates + lines + '</svg><div class="mt-4 flex flex-wrap gap-3">' + legend + '</div></div>'; }
function reportsPanelV2() {
  const cfg = reportCfg();
  const data = computeReports();
  const levelOpts = orderedLevels().map(l => '<option value="' + esc(l.id) + '" ' + (cfg.selectedLevelId === l.id ? 'selected' : '') + '>' + esc(l.title) + '</option>').join('');
  const lessonOpts = data.lessons.map(l => '<option value="' + esc(l.id) + '" ' + (cfg.selectedLessonId === l.id ? 'selected' : '') + '>' + esc(l.title) + '</option>').join('');
  const labelClass = 'text-[11px] md:text-[13px] font-bold text-gray-400 uppercase ml-1 mb-2 block';
  const inputClass = 'w-full bg-[#F8F8FC] border border-gray-200 rounded-xl px-5 py-4 text-base font-bold text-[#6B48FF] outline-none focus:border-[#6B48FF]';
  const field = (label, control) => '<label class="block min-w-0"><span class="' + labelClass + '">' + label + '</span>' + control + '</label>';
  const stat = (label, value, icon) => '<div class="card-solid p-4 md:p-6"><div class="flex items-start justify-between gap-3 md:gap-4"><div class="min-w-0"><p class="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400 md:text-[11px] md:tracking-[0.2em]">' + label + '</p><p class="mt-2 text-2xl font-black tracking-tight text-[#2D2A4A] md:mt-3 md:text-3xl">' + value + '</p></div><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4F2FF] text-sm text-[#6B48FF] md:h-12 md:w-12 md:text-lg"><i class="fa-solid ' + icon + '"></i></span></div></div>';
  const chips = data.comparisonOptions.map(o => '<button data-report-compare="' + esc(o.id) + '" class="min-h-[40px] rounded-full px-4 py-2 text-xs font-black transition active-scale ' + (data.selected.includes(o.id) ? 'bg-[#6B48FF] text-white shadow-md shadow-[#6B48FF]/20' : 'bg-[#F8F8FC] text-gray-500 border border-gray-100') + '">' + esc(o.label) + '</button>').join('');
  const summaryRows = data.summaryRows.map(r => '<tr class="bg-[#F8F8FC] text-sm font-semibold text-gray-600 shadow-sm"><td class="rounded-l-[1.1rem] px-4 py-4 font-black text-[#2D2A4A]">' + esc(r.label) + '</td><td class="px-4 py-4"><span class="rounded-full bg-white px-3 py-1.5 font-black text-[#2D2A4A] shadow-sm">' + r.averageScore + '%</span></td><td class="px-4 py-4">' + r.submitCount + '</td><td class="px-4 py-4">' + r.unitCount + '</td>' + (cfg.viewMode === 'class' ? '<td class="px-4 py-4">' + r.studentCount + '</td>' : '') + '<td class="rounded-r-[1.1rem] px-4 py-4">' + reportDateTime(r.latestSubmittedAt) + '</td></tr>').join('');
  const summaryCards = data.summaryRows.map(r => '<article class="rounded-[1.15rem] border border-gray-100 bg-[#F8F8FC] p-4 shadow-sm"><div class="flex items-start justify-between gap-3"><div class="min-w-0"><p class="truncate text-base font-black text-[#2D2A4A]">' + esc(r.label) + '</p><p class="mt-1 text-xs font-bold text-gray-400">最近 ' + reportDateTime(r.latestSubmittedAt) + '</p></div><span class="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-black text-[#6B48FF] shadow-sm">' + r.averageScore + '%</span></div><div class="mt-4 grid gap-2 text-center" style="grid-template-columns:repeat(' + (cfg.viewMode === 'class' ? '3' : '2') + ',minmax(0,1fr))"><div class="rounded-xl bg-white px-2 py-2 shadow-sm"><p class="text-[10px] font-black text-gray-400">提交</p><p class="mt-1 text-sm font-black text-[#2D2A4A]">' + r.submitCount + '</p></div><div class="rounded-xl bg-white px-2 py-2 shadow-sm"><p class="text-[10px] font-black text-gray-400">单元</p><p class="mt-1 text-sm font-black text-[#2D2A4A]">' + r.unitCount + '</p></div>' + (cfg.viewMode === 'class' ? '<div class="rounded-xl bg-white px-2 py-2 shadow-sm"><p class="text-[10px] font-black text-gray-400">学生</p><p class="mt-1 text-sm font-black text-[#2D2A4A]">' + r.studentCount + '</p></div>' : '') + '</div></article>').join('');
  const detailRows = data.latestRows.map(r => '<tr class="bg-[#F8F8FC] text-sm font-semibold text-gray-600 shadow-sm"><td class="rounded-l-[1.1rem] px-4 py-4 font-black text-[#2D2A4A]">' + esc(reportEntityLabel(r,cfg.viewMode)) + '</td><td class="px-4 py-4"><div class="font-black text-[#2D2A4A]">' + esc(r.moduleTitle) + '</div><div class="mt-1 text-xs font-bold text-gray-400">' + esc(r.levelCode) + '</div></td><td class="px-4 py-4"><span class="rounded-full bg-white px-3 py-1.5 text-xs font-black text-gray-600 shadow-sm">' + esc(r.sourceLabel) + '</span></td><td class="px-4 py-4"><span class="rounded-full bg-[#F4F2FF] px-3 py-1.5 font-black text-[#6B48FF]">' + r.scorePercent + '%</span></td><td class="rounded-r-[1.1rem] px-4 py-4">' + reportDateTime(r.submittedAt) + '</td></tr>').join('');
  const detailCards = data.latestRows.map(r => '<article class="rounded-[1.15rem] border border-gray-100 bg-[#F8F8FC] p-4 shadow-sm"><div class="flex items-start justify-between gap-3"><div class="min-w-0"><p class="truncate text-sm font-black text-[#2D2A4A]">' + esc(reportEntityLabel(r,cfg.viewMode)) + '</p><p class="mt-1 truncate text-xs font-bold text-gray-400">' + reportDateTime(r.submittedAt) + '</p></div><span class="shrink-0 rounded-full bg-[#F4F2FF] px-3 py-1.5 text-sm font-black text-[#6B48FF]">' + r.scorePercent + '%</span></div><div class="mt-3 rounded-xl bg-white px-3 py-3 shadow-sm"><p class="line-clamp-2 text-sm font-black leading-5 text-[#2D2A4A]">' + esc(r.moduleTitle) + '</p><div class="mt-2 flex flex-wrap gap-2"><span class="rounded-full bg-[#F8F8FC] px-2.5 py-1 text-[11px] font-black text-gray-500">' + esc(r.levelCode) + '</span><span class="rounded-full bg-[#F8F8FC] px-2.5 py-1 text-[11px] font-black text-gray-500">' + esc(r.sourceLabel) + '</span></div></div></article>').join('');
  const bucketRows = data.buckets.map(b => {
    const total = data.latestRows.length;
    const pct = total ? Math.round(b.count / total * 100) : 0;
    return '<div class="rounded-xl border border-gray-100 bg-[#F8F8FC] px-4 py-3"><div class="flex items-center justify-between gap-3"><div class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full" style="background:' + b.color + '"></span><span class="text-sm font-black text-[#2D2A4A]">' + b.label + '</span></div><span class="text-sm font-black text-gray-500">' + b.count + ' 项</span></div><div class="mt-3 h-2 overflow-hidden rounded-full bg-white"><div class="h-full rounded-full" style="width:' + pct + '%;background:' + b.color + '"></div></div></div>';
  }).join('');
  const analysisCapsules = [
    ['fa-file-contract','text-blue-400','全景做题报告'],
    ['fa-chart-line','text-purple-400','纵向成长曲线'],
    ['fa-chart-pie','text-emerald-400','横向雷达图'],
    ['fa-users-rays','text-orange-400','同伴分布对比']
  ].map(item => '<div class="card-solid p-5 text-center transition-transform hover:-translate-y-1"><i class="fa-solid ' + item[0] + ' mb-3 block text-3xl ' + item[1] + ' md:mb-4 md:text-4xl"></i><h3 class="mt-1 text-sm font-extrabold text-[#2D2A4A] md:text-base">' + item[2] + '</h3></div>').join('');
  return '<div class="tab-content active space-y-5 md:space-y-6">' +
    '<section class="grid grid-cols-2 gap-4 md:grid-cols-4">' + analysisCapsules + '</section>' +
    '<section class="card-solid overflow-hidden">' +
      '<div class="flex flex-col gap-4 border-b border-gray-100 bg-gradient-to-r from-[#F8F8FC] via-white to-[#F4F2FF] px-5 py-5 md:flex-row md:items-end md:justify-between md:px-6">' +
        '<div class="min-w-0"><p class="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Reports</p><h2 class="mt-3 text-2xl font-black text-[#2D2A4A] md:text-3xl">报表</h2></div>' +
        '<button data-report-refresh class="inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-black text-[#6B48FF] shadow-sm active-scale">' + (cfg.loading ? '<i class="fa-solid fa-spinner fa-spin sm:mr-2"></i><span class="hidden sm:inline">同步中</span>' : '<i class="fa-solid fa-rotate sm:mr-2"></i><span class="hidden sm:inline">刷新</span>') + '</button>' +
      '</div>' +
      '<div class="px-5 py-5 md:px-6"><div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">' +
        field('开始日期', '<input data-report-field="startDate" type="datetime-local" value="' + esc(cfg.startDate) + '" max="' + esc(cfg.endDate) + '" class="' + inputClass + '">') +
        field('结束日期', '<input data-report-field="endDate" type="datetime-local" value="' + esc(cfg.endDate) + '" min="' + esc(cfg.startDate) + '" class="' + inputClass + '">') +
        field('课程', '<select data-report-field="selectedLevelId" class="' + inputClass + '"><option value="all">全部课程</option>' + levelOpts + '</select>') +
        field('单元', '<select data-report-field="selectedLessonId" class="' + inputClass + '"><option value="all">全部单元</option>' + lessonOpts + '</select>') +
        field('数据来源', '<select data-report-field="sourceFilter" class="' + inputClass + '"><option value="all" selected>全部</option></select>') +
        field('查看维度', '<select data-report-field="viewMode" class="' + inputClass + '"><option value="student" ' + (cfg.viewMode === 'student' ? 'selected' : '') + '>学生</option><option value="class" ' + (cfg.viewMode === 'class' ? 'selected' : '') + '>班级</option></select>') +
      '</div>' +
      (cfg.error ? '<p class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-500">' + esc(cfg.error) + '</p>' : '') +
      '</div>' +
    '</section>' +
    '<section class="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">' +
      stat('参与学生', cfg.loading ? '--' : data.stats.studentCount, 'fa-user-graduate') +
      stat('参与班级', cfg.loading ? '--' : data.stats.classCount, 'fa-people-group') +
      stat('提交次数', cfg.loading ? '--' : data.stats.submitCount, 'fa-file-circle-check') +
      stat('平均正确率', cfg.loading ? '--' : data.stats.averageScore + '%', 'fa-chart-simple') +
    '</section>' +
    '<section class="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">' +
      '<div class="card-solid overflow-hidden"><div class="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6"><div><p class="text-xs font-black uppercase tracking-[0.24em] text-gray-400">Trend</p><h3 class="mt-2 text-xl font-black text-[#2D2A4A]">成绩趋势对比</h3></div><span class="rounded-full bg-[#F8F8FC] px-3 py-1 text-xs font-black text-gray-500">最多 5 条线</span></div><div class="space-y-4 px-5 py-5 md:px-6"><div class="flex flex-wrap gap-2">' + (chips || '<span class="text-sm font-bold text-gray-400">暂无可对比对象</span>') + '</div>' + reportTrendSvg(data) + '</div></div>' +
      '<div class="card-solid overflow-hidden"><div class="border-b border-gray-100 px-5 py-5 md:px-6"><p class="text-xs font-black uppercase tracking-[0.24em] text-gray-400">Distribution</p><h3 class="mt-2 text-xl font-black text-[#2D2A4A]">分数段分布</h3></div><div class="space-y-5 px-5 py-5 md:px-6"><div class="mx-auto flex h-44 w-44 items-center justify-center rounded-full bg-[#F8F8FC] shadow-inner"><div class="relative flex h-40 w-40 items-center justify-center rounded-full" style="background-image:' + reportPieBackground(data.buckets) + '"><div class="absolute inset-[28px] rounded-full bg-white shadow-inner"></div><div class="relative text-center"><p class="text-xs font-black text-gray-400">单元成绩</p><p class="mt-1 text-3xl font-black text-[#2D2A4A]">' + data.latestRows.length + '</p></div></div></div><div class="space-y-3">' + bucketRows + '</div></div></div>' +
    '</section>' +
    reportTableSection(cfg.viewMode === 'class' ? '班级成绩查看' : '学生成绩查看', cfg.viewMode === 'class' ? '班级' : '学生', summaryRows, cfg.viewMode === 'class', summaryCards) +
    reportDetailSection(detailRows, detailCards) +
    '</div>';
}
function reportTableSection(title, firstHead, rows, hasStudentCount, mobileCards) { const empty = '<div class="rounded-[1.4rem] border border-dashed border-gray-200 bg-[#F8F8FC] px-5 py-8 text-center text-sm font-bold text-gray-400">暂无成绩数据。</div>'; return '<section class="card-solid overflow-hidden"><div class="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6"><div><p class="text-xs font-black uppercase tracking-[0.24em] text-gray-400">Ranking</p><h3 class="mt-2 text-xl font-black text-[#2D2A4A]">' + title + '</h3></div></div><div class="space-y-3 px-4 py-4 md:hidden">' + (mobileCards || empty) + '</div><div class="hidden px-5 py-5 md:block md:px-6">' + (rows ? '<table class="w-full min-w-[760px] border-separate border-spacing-y-2"><thead><tr class="text-left text-xs font-black uppercase tracking-[0.16em] text-gray-400"><th class="px-4 py-2">' + firstHead + '</th><th class="px-4 py-2">平均正确率</th><th class="px-4 py-2">提交次数</th><th class="px-4 py-2">覆盖单元</th>' + (hasStudentCount ? '<th class="px-4 py-2">学生数</th>' : '') + '<th class="px-4 py-2">最近提交</th></tr></thead><tbody>' + rows + '</tbody></table>' : empty) + '</div></section>'; }
function reportDetailSection(rows, mobileCards) { const empty = '<div class="rounded-[1.4rem] border border-dashed border-gray-200 bg-[#F8F8FC] px-5 py-8 text-center text-sm font-bold text-gray-400">暂无单元明细。</div>'; return '<section class="card-solid overflow-hidden"><div class="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6"><div><p class="text-xs font-black uppercase tracking-[0.24em] text-gray-400">Unit Details</p><h3 class="mt-2 text-xl font-black text-[#2D2A4A]">单元明细</h3></div></div><div class="space-y-3 px-4 py-4 md:hidden">' + (mobileCards || empty) + '</div><div class="hidden px-5 py-5 md:block md:px-6">' + (rows ? '<table class="w-full min-w-[820px] border-separate border-spacing-y-2"><thead><tr class="text-left text-xs font-black uppercase tracking-[0.16em] text-gray-400"><th class="px-4 py-2">对象</th><th class="px-4 py-2">单元</th><th class="px-4 py-2">来源</th><th class="px-4 py-2">正确率</th><th class="px-4 py-2">提交时间</th></tr></thead><tbody>' + rows + '</tbody></table>' : empty) + '</div></section>'; }
function attendancePanel() {
  const cfg = attendanceCfg();
  const classOptions = teacherClasses().map(c => '<option value="' + esc(c.code) + '" ' + (cfg.classCode === c.code ? 'selected' : '') + '>' + esc(c.name) + '</option>').join('');
  const classStudents = attendanceClassStudents(cfg.classCode);
  const start = attendanceBoundary(cfg.startDate, false);
  const end = attendanceBoundary(cfg.endDate, true);
  const fallbackSubmissions = start && end ? attendanceSubmissionsInRange(state.logs || [], start, end) : [];
  const submissions = (cfg.submissions || []).length ? cfg.submissions : fallbackSubmissions;
  const selected = new Set(cfg.selectedIds || []);
  const selectedStudents = attendancePayloadStudentRows();
  const selectedPreview = selectedStudents.slice(0, 6).map(s => '<span class="rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#2D2A4A] shadow-sm">' + esc(s.name || s.id) + '</span>').join('');
  const submissionMap = attendanceSubmissionMap(submissions);
  const exemptionMap = attendanceExemptionMap(cfg.records || []);
  const rows = classStudents.map(s => {
    const id = String(s.id);
    const submission = submissionMap.get(id);
    const exemption = exemptionMap.get(id);
    const success = Boolean(submission || exemption);
    return { student:s, submission, exemption, status:exemption ? 'exempt' : (success ? 'present' : 'absent') };
  });
  const statusMeta = statusCountMap(rows);
  const recordRows = rows.map(r => {
    const meta = attendanceStatusMeta(r.status);
    const source = r.submission ? '已完成：' + r.submission.titles.join(' / ') : (r.exemption ? '豁免：' + String(r.exemption.note || '').replace(/^豁免[:：]\s*/, '') : '--');
    const time = r.submission ? attendanceDateTime(r.submission.latest.created_at || r.submission.latest.submitted_at || r.submission.latest.date) : (r.exemption ? attendanceDateTime(r.exemption.created_at || r.exemption.start_at) : '--');
    return '<tr class="bg-[#F8F8FC] text-sm font-semibold text-gray-600 shadow-sm"><td class="rounded-l-[1.1rem] px-4 py-4"><div class="font-black text-[#2D2A4A]">' + esc(r.student.name || r.student.id) + '</div><div class="mt-1 font-mono text-xs font-bold text-gray-400">' + esc(r.student.id) + '</div></td><td class="px-4 py-4"><span class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ' + meta[3] + '"><i class="fa-solid ' + meta[2] + '"></i>' + meta[1] + '</span></td><td class="px-4 py-4 max-w-[18rem] truncate">' + esc(source) + '</td><td class="rounded-r-[1.1rem] px-4 py-4">' + time + '</td></tr>';
  }).join('');
  const recordSummary = '<div class="flex flex-wrap gap-2 text-xs font-black"><span class="rounded-full bg-[#F4F2FF] px-3 py-1.5 text-[#6B48FF]">共 ' + classStudents.length + ' 人</span><span class="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">打卡成功 ' + (statusMeta.present || 0) + '</span><span class="rounded-full bg-sky-50 px-3 py-1.5 text-sky-700">豁免 ' + (statusMeta.exempt || 0) + '</span><span class="rounded-full bg-rose-50 px-3 py-1.5 text-rose-700">未打卡 ' + (statusMeta.absent || 0) + '</span></div>';
  return '<div class="tab-content active space-y-5 md:space-y-6">' +
    '<section class="card-solid overflow-hidden">' +
      '<div class="border-b border-gray-100 bg-gradient-to-r from-[#F8F8FC] via-white to-[#F4F2FF] px-5 py-5 md:px-6"><p class="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Exemption</p><h2 class="mt-3 text-2xl font-black text-[#2D2A4A] md:text-3xl">豁免权管理</h2>' + (cfg.error ? '<p class="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-500">打卡或豁免数据读取失败：' + esc(cfg.error) + '<br>请确认 supabase-attendance-setup.sql 与 supabase-growth-logs-setup.sql 已执行。</p>' : '') + '</div>' +
      '<div class="grid gap-4 px-5 py-5 md:grid-cols-2 md:px-6 xl:grid-cols-3">' +
        attendanceField('班级', '<select data-att-field="classCode" class="' + attendanceInputClass() + '">' + classOptions + '</select>') +
        attendanceField('开始日期', '<input data-att-field="startDate" type="date" value="' + esc(String(cfg.startDate || '').slice(0,10)) + '" max="' + esc(String(cfg.endDate || '').slice(0,10)) + '" class="' + attendanceInputClass() + '">') +
        attendanceField('结束日期', '<input data-att-field="endDate" type="date" value="' + esc(String(cfg.endDate || '').slice(0,10)) + '" min="' + esc(String(cfg.startDate || '').slice(0,10)) + '" class="' + attendanceInputClass() + '">') +
      '</div>' +
      '<div class="grid gap-4 px-5 pb-5 md:px-6 xl:grid-cols-[minmax(0,0.52fr)_minmax(0,0.48fr)]">' +
        '<label><span class="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-gray-400">豁免原因</span><select data-att-field="note" class="' + attendanceInputClass() + '"><option value="事假" ' + ((cfg.note || '事假') === '事假' ? 'selected' : '') + '>事假</option><option value="病假" ' + (cfg.note === '病假' ? 'selected' : '') + '>病假</option></select></label>' +
        '<div><span class="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-gray-400">豁免学生</span><button data-open-att-picker class="flex min-h-[48px] w-full items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-[#F8F8FC] px-4 py-3 text-left active-scale"><span class="min-w-0"><span class="block text-sm font-black text-[#2D2A4A]">已选择 ' + selected.size + ' 人</span></span><i class="fa-solid fa-chevron-right text-[#6B48FF]"></i></button></div>' +
      '</div>' +
      '<div class="px-5 pb-6 md:px-6"><div class="mb-4 rounded-[1.4rem] border border-gray-100 bg-[#F8F8FC] p-4"><div class="mb-2 flex items-center justify-between gap-3"><p class="text-sm font-black text-[#2D2A4A]">本次豁免学生</p><button data-att-clear class="rounded-full bg-white px-3 py-1.5 text-xs font-black text-gray-500 shadow-sm active-scale">清空</button></div><div class="flex flex-wrap gap-2">' + (selectedPreview || '<span class="text-sm font-bold text-gray-400">还没有选择学生</span>') + (selectedStudents.length > 6 ? '<span class="rounded-full bg-white px-3 py-1.5 text-xs font-black text-gray-400 shadow-sm">+' + (selectedStudents.length - 6) + '</span>' : '') + '</div></div><button data-save-attendance id="btn-att-save" class="w-full rounded-xl bg-[#2D2A4A] py-4 text-base font-bold text-white shadow-lg shadow-[#2D2A4A]/20 active-scale"><i class="fa-solid fa-shield-heart mr-2"></i> 应用豁免</button></div>' +
    '</section>' +
    '<details class="card-solid overflow-hidden" open><summary class="flex cursor-pointer list-none flex-col gap-3 border-b border-gray-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6"><div><p class="text-xs font-black uppercase tracking-[0.24em] text-gray-400">Records</p><h3 class="mt-2 text-xl font-black text-[#2D2A4A]">打卡记录</h3></div><div class="flex flex-col gap-3 sm:flex-row sm:items-center">' + recordSummary + '<button data-refresh-attendance class="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full bg-[#6B48FF] px-4 py-2 text-xs font-black text-white shadow-lg shadow-[#6B48FF]/25 active-scale">' + (cfg.loading ? '<i class="fa-solid fa-spinner fa-spin"></i>刷新中' : '<i class="fa-solid fa-rotate"></i>刷新') + '</button></div></summary><div class="overflow-x-auto px-5 py-5 md:px-6">' + (recordRows ? '<table class="w-full min-w-[680px] border-separate border-spacing-y-2"><thead><tr class="text-left text-xs font-black uppercase tracking-[0.16em] text-gray-400"><th class="px-4 py-2">学生</th><th class="px-4 py-2">状态</th><th class="px-4 py-2">依据</th><th class="px-4 py-2">时间</th></tr></thead><tbody>' + recordRows + '</tbody></table>' : '<div class="rounded-[1.4rem] border border-dashed border-gray-200 bg-[#F8F8FC] px-5 py-8 text-center text-sm font-bold text-gray-400">' + (cfg.loading ? '正在读取打卡记录...' : '该班级暂无学生。') + '</div>') + '</div></details>' +
    '</div>';
}
function voteData() { return window.XY_VOTE || { classOptions:[], templates:{}, topics:[] }; }
function voteCfg() {
  if (!state.vote) state.vote = { topics: [], submissions: [], selectedTopicNumber: null, loading: false, loaded: false, error: '', submitting: false, success: null, resultsLoading: false, resultsLoaded: false, resultsError: '', classFilter: 'all' };
  return state.vote;
}
function voteTemplate(type) { const data = voteData(); return (data.templates && data.templates[type]) || (data.templates && data.templates.OPINION) || []; }
function voteTopicLabel(t) { return '#' + t.topicNumber + ' · ' + (t.topicType === 'STORY' ? 'Story' : (t.topicType === 'IMAGINATION' ? 'Imagination' : 'Opinion')); }
function normalizeVoteTopic(row) {
  return { id:row.id || '', topicNumber:Number(row.topic_number ?? row.topicNumber), titleEn:row.title_en ?? row.titleEn ?? '', titleZh:row.title_zh ?? row.titleZh ?? '', topicType:row.topic_type ?? row.topicType ?? 'OPINION', allowMultiple:Boolean(row.allow_multiple ?? row.allowMultiple), isLocked:Boolean(row.is_locked ?? row.isLocked), submissionCount:Number(row.submission_count ?? row.submissionCount ?? 0) || 0 };
}
function initialVoteTopics() { return (voteData().topics || []).map(normalizeVoteTopic).sort((a,b) => a.topicNumber - b.topicNumber); }
function mergeVoteTopics(rows) {
  const map = new Map(initialVoteTopics().map(t => [t.topicNumber, t]));
  (rows || []).map(normalizeVoteTopic).forEach(t => map.set(t.topicNumber, { ...(map.get(t.topicNumber) || {}), ...t }));
  return Array.from(map.values()).sort((a,b) => a.topicNumber - b.topicNumber);
}
function normalizeVoteSubmission(row) {
  return { id:row.id, topicNumber:Number(row.topic_number ?? row.topicNumber), topicTitleEn:row.topic_title_en ?? row.topicTitleEn ?? '', topicTitleZh:row.topic_title_zh ?? row.topicTitleZh ?? '', topicType:row.topic_type ?? row.topicType ?? 'OPINION', studentClass:row.student_class ?? row.studentClass ?? '', studentName:row.student_name ?? row.studentName ?? '', answers:row.answers || {}, remarks:row.remarks || '', submittedAt:row.submitted_at ?? row.submittedAt ?? '' };
}
function voteErrorMessage(error) {
  const msg = String(error && (error.message || error.details || error.hint) || error || '');
  if (msg.includes('42P01')) return '请先在 Supabase 执行 vote 数据库补丁。';
  if (msg.includes('TOPIC_ALREADY_TAKEN')) return '这个话题刚刚已经被其他同学选走了，请返回列表重新选择。';
  if (msg.includes('STUDENT_ALREADY_SUBMITTED')) return '这个班级和姓名已经提交过一次，不能重复提交。';
  if (msg.includes('INVALID_CLASS')) return '请选择指定的参与班级。';
  if (msg.includes('MISSING_ANSWER')) return '请填完所有必填内容后再提交。';
  return msg || '选题数据处理失败。';
}
async function loadVoteTopics(showDone) {
  const cfg = voteCfg();
  cfg.loading = true; cfg.error = ''; cfg.topics = cfg.topics.length ? cfg.topics : initialVoteTopics(); render();
  const { data, error } = await sb.from('vote_topic_status').select('*').order('topic_number', { ascending:true });
  cfg.loading = false; cfg.loaded = true;
  if (error) cfg.error = voteErrorMessage(error);
  else cfg.topics = mergeVoteTopics(data || []);
  if (showDone && !cfg.error) toast('选题状态已刷新。');
  render();
}
function selectedVoteTopic() { const cfg = voteCfg(); return (cfg.topics.length ? cfg.topics : initialVoteTopics()).find(t => t.topicNumber === cfg.selectedTopicNumber) || null; }
function voteTopicCard(t) {
  const locked = t.isLocked && !t.allowMultiple;
  return '<button type="button" ' + (locked ? 'disabled data-toast="这个话题已经被选择了"' : 'data-vote-select="' + t.topicNumber + '"') + ' class="motion-list-item motion-card group flex min-h-[124px] items-start justify-between gap-4 rounded-[1.5rem] border p-5 text-left shadow-sm transition disabled:cursor-not-allowed ' + (locked ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-slate-200 bg-white text-slate-900 hover:border-blue-200') + '"><span class="min-w-0 flex-1"><span class="block text-[15px] font-black leading-6 ' + (locked ? 'line-through' : '') + '">' + esc(t.topicNumber) + '. ' + esc(t.titleEn) + '</span><span class="mt-2 block text-sm font-semibold leading-6 ' + (locked ? 'line-through' : 'text-slate-500') + '">(' + esc(t.titleZh) + ')</span></span><span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full ' + (locked ? 'bg-slate-200 text-slate-400' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white') + '"><span class="material-symbols-outlined text-[21px]">' + (locked ? 'lock' : 'chevron_right') + '</span></span></button>';
}
function voteForm(topic) {
  const opts = voteData().classOptions.map(c => '<option value="' + esc(c) + '">' + esc(c) + '</option>').join('');
  const fields = voteTemplate(topic.topicType).map(f => '<label class="block rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"><span class="mb-3 block text-sm font-black text-slate-800">' + esc(f.labelEn) + ' <span class="font-semibold text-slate-500">(' + esc(f.labelZh) + ')</span> *</span><textarea required data-vote-answer="' + esc(f.id) + '" rows="4" placeholder="Type here..." class="min-h-[108px] w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-400"></textarea></label>').join('');
  return '<div class="slide-in-right mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.42)] md:p-7"><button type="button" data-vote-back class="motion-button inline-flex min-h-[44px] items-center gap-2 rounded-full bg-slate-100 px-4 text-sm font-black text-slate-600"><span class="material-symbols-outlined text-[19px]">arrow_back</span>返回列表</button><div class="mt-7 border-b border-slate-100 pb-6"><p class="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Selected Topic</p><h2 class="mt-3 text-2xl font-black leading-tight text-slate-950">' + esc(topic.topicNumber) + '. ' + esc(topic.titleEn) + '</h2><p class="mt-2 text-base font-semibold text-slate-500">(' + esc(topic.titleZh) + ')</p></div><form id="vote-form" class="mt-6 space-y-5"><div class="grid gap-4 sm:grid-cols-2"><label class="block"><span class="mb-2 block text-sm font-black text-slate-700">Class 班级 *</span><select id="vote-class" required class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition focus:border-blue-400 focus:bg-white">' + opts + '</select></label><label class="block"><span class="mb-2 block text-sm font-black text-slate-700">Name 姓名 *</span><input id="vote-name" required autocomplete="name" placeholder="Your name" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"></label></div><div class="rounded-[1.5rem] bg-slate-950 px-5 py-4 text-sm font-semibold leading-7 text-white">English preferred, Chinese can be used for supplementation. 首选用英文，中文可补充。</div>' + fields + '<label class="block rounded-[1.5rem] border border-indigo-100 bg-indigo-50/60 p-4"><span class="mb-3 block text-sm font-black text-slate-800">Remarks / Any other thoughts? <span class="font-semibold text-slate-500">(选填)</span></span><textarea id="vote-remarks" rows="3" placeholder="Share any extra ideas, questions, or crazy thoughts here..." class="min-h-[96px] w-full resize-y rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm font-semibold leading-6 outline-none transition placeholder:text-slate-400 focus:border-indigo-400"></textarea></label>' + (voteCfg().error ? '<div class="rounded-[1.25rem] border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">' + esc(voteCfg().error) + '</div>' : '') + '<button type="submit" ' + (voteCfg().submitting ? 'disabled' : '') + ' class="motion-button flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-black text-white shadow-[0_16px_38px_-20px_rgba(37,99,235,0.9)] disabled:cursor-not-allowed disabled:bg-slate-300"><span class="material-symbols-outlined text-[20px]">' + (voteCfg().submitting ? 'sync' : 'send') + '</span>' + (voteCfg().submitting ? 'Submitting... 提交中...' : 'Submit 一键提交') + '</button></form></div>';
}
function votePage() {
  const cfg = voteCfg();
  if (!cfg.loaded && !cfg.loading) setTimeout(() => loadVoteTopics(false), 0);
  const topic = selectedVoteTopic();
  const topics = (cfg.topics.length ? cfg.topics : initialVoteTopics());
  if (cfg.success) return '<div class="min-h-dvh bg-[#f6f8fb] px-4 py-8 text-slate-900"><div class="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center rounded-[2.25rem] border border-emerald-100 bg-white px-8 py-14 text-center shadow-[0_24px_70px_-38px_rgba(15,118,110,0.45)]"><span class="material-symbols-outlined text-[5rem] text-emerald-500">check_circle</span><p class="mt-6 text-xs font-black uppercase tracking-[0.28em] text-emerald-600">Submitted</p><h1 class="mt-3 text-3xl font-black tracking-tight text-slate-950">提交成功</h1><p class="mt-4 max-w-sm text-sm font-semibold leading-7 text-slate-500">选题和填写内容已记录到后台。</p><button type="button" data-vote-clear-success class="motion-button mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full bg-slate-950 px-7 text-sm font-black text-white">返回话题列表</button></div></div>';
  return '<div class="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-100 sm:py-8" style="font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"><div class="mx-auto flex min-h-screen w-full max-w-xl flex-col overflow-hidden border border-slate-100 bg-white shadow-sm sm:min-h-[850px] sm:rounded-2xl sm:shadow-xl"><header class="cursor-default border-b border-slate-200 bg-white px-6 pb-8 pt-10"><div class="relative flex flex-col items-center text-center"><span class="mb-4 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold tracking-widest text-blue-600 sm:text-xs">2026年英语作品录制季即将开始······</span><h1 class="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Annual Inquiry Project</h1><div class="mb-2 flex w-full items-center justify-center gap-3"><div class="h-px max-w-[40px] flex-1 bg-slate-200"></div><h2 class="text-[14px] font-medium tracking-[0.1em] text-slate-500 sm:text-[15px]">2026年度期末探究项目 · 选题预选</h2><div class="h-px max-w-[40px] flex-1 bg-slate-200"></div></div></div><div class="mt-6 flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-3 shadow-sm"><span class="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-orange-500">notifications_active</span><div class="text-sm"><strong class="mb-0.5 block text-orange-800">Mandatory Participants (指定参与班级):</strong><span class="font-medium text-orange-700">Talent A1+, A2, A2+</span><p class="mt-1 text-xs text-orange-600">* Limit 1 topic per person (每人限选1个话题)</p></div></div><div class="mt-4 flex items-start rounded-xl border border-slate-200/60 bg-slate-50 p-4 shadow-sm"><div class="mr-3 mt-0.5 shrink-0 rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm"><span class="material-symbols-outlined text-[16px] text-slate-600">info</span></div><p class="text-left text-[13px] leading-relaxed text-slate-700"><strong class="mb-0.5 block text-sm text-slate-900">Topic Selection Guidelines</strong>Pick a topic that sparks your curiosity and makes you want to express yourself!<br><span class="mt-1 block text-slate-500">(选题指引：挑选一个能激发你好奇心、让你有表达欲的话题吧！)</span></p></div>' + (cfg.error && !topic ? '<div class="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold leading-6 text-rose-700">' + esc(cfg.error) + '</div>' : '') + '</header><main class="flex-1 bg-slate-50/30"><section class="' + (topic ? 'p-6' : 'p-4 pb-12') + '">' + (topic ? voteForm(topic) : '<div class="motion-panel-enter space-y-3"><div class="flex flex-col gap-3 px-1 sm:flex-row sm:items-end sm:justify-between"><div><p class="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Topics</p><h2 class="mt-2 text-2xl font-black text-slate-950">话题列表</h2></div><button type="button" data-vote-refresh ' + (cfg.loading ? 'disabled' : '') + ' class="motion-button inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-black text-slate-600 shadow-sm disabled:opacity-60"><span class="material-symbols-outlined text-[18px]">refresh</span>' + (cfg.loading ? '刷新中' : '刷新状态') + '</button></div><div class="grid gap-3">' + topics.map(voteTopicCard).join('') + '</div></div>') + '</section></main></div></div>';
}
async function submitVoteForm(form) {
  const cfg = voteCfg(); const topic = selectedVoteTopic(); if (!topic || cfg.submitting) return;
  const answers = {}; form.querySelectorAll('[data-vote-answer]').forEach(el => { answers[el.dataset.voteAnswer] = el.value.trim(); });
  const studentClass = form.querySelector('#vote-class').value;
  const studentName = form.querySelector('#vote-name').value.trim();
  const remarks = form.querySelector('#vote-remarks').value.trim();
  const missing = voteTemplate(topic.topicType).some(f => !answers[f.id]);
  if (!studentClass || !studentName || missing) { cfg.error = '请填完所有必填内容后再提交。'; render(); return; }
  cfg.submitting = true; cfg.error = ''; render();
  const { data, error } = await sb.rpc('submit_vote_selection', { p_topic_number: topic.topicNumber, p_student_class: studentClass, p_student_name: studentName, p_answers: answers, p_remarks: remarks || null });
  cfg.submitting = false;
  if (error) { cfg.error = voteErrorMessage(error); render(); return; }
  cfg.success = { topicNumber:topic.topicNumber, studentName, id:data && data.submissionId };
  cfg.selectedTopicNumber = null; await loadVoteTopics(false);
}
async function loadVoteResults(showDone) {
  const cfg = voteCfg(); cfg.resultsLoading = true; cfg.resultsError = ''; render();
  const { data, error } = await sb.from('vote_submissions').select('id, topic_number, topic_title_en, topic_title_zh, topic_type, student_class, student_name, answers, remarks, submitted_at').order('submitted_at', { ascending:false });
  cfg.resultsLoading = false; cfg.resultsLoaded = true;
  if (error) cfg.resultsError = voteErrorMessage(error);
  else cfg.submissions = (data || []).map(normalizeVoteSubmission);
  if (showDone && !cfg.resultsError) toast('选题记录已刷新。');
  render();
}
function voteAnswerSummary(s) {
  return voteTemplate(s.topicType).map(f => { const value = s.answers && s.answers[f.id]; return value ? '<div class="mb-2"><b class="text-[#2D2A4A]">' + esc(f.labelZh) + '：</b>' + esc(value) + '</div>' : ''; }).join('') + (s.remarks ? '<div><b class="text-[#2D2A4A]">备注：</b>' + esc(s.remarks) + '</div>' : '');
}
function voteResultsPanel() {
  const cfg = voteCfg();
  if (!cfg.resultsLoaded && !cfg.resultsLoading) setTimeout(() => loadVoteResults(false), 0);
  const filtered = cfg.classFilter === 'all' ? cfg.submissions : cfg.submissions.filter(s => s.studentClass === cfg.classFilter);
  const stats = ['all'].concat(voteData().classOptions).map(c => '<option value="' + esc(c) + '" ' + (cfg.classFilter === c ? 'selected' : '') + '>' + (c === 'all' ? '全部班级' : esc(c)) + '</option>').join('');
  const rows = filtered.map(s => '<tr class="bg-[#F8F8FC] align-top text-sm font-semibold text-gray-600 shadow-sm"><td class="rounded-l-[1.1rem] px-4 py-4"><div class="font-black text-[#2D2A4A]">#' + s.topicNumber + ' ' + esc(s.topicTitleEn) + '</div><div class="mt-1 text-xs font-bold text-gray-400">' + esc(s.topicTitleZh) + '</div></td><td class="px-4 py-4"><div class="font-black text-[#2D2A4A]">' + esc(s.studentName) + '</div><div class="mt-1 text-xs font-bold text-gray-400">' + esc(s.studentClass) + '</div></td><td class="max-w-[28rem] px-4 py-4 leading-6">' + voteAnswerSummary(s) + '</td><td class="px-4 py-4 whitespace-nowrap">' + attendanceDateTime(s.submittedAt) + '</td><td class="rounded-r-[1.1rem] px-4 py-4"><button data-delete-vote="' + esc(s.id) + '" class="rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-500 active-scale">删除</button></td></tr>').join('');
  return '<div class="tab-content active space-y-5 md:space-y-6"><section class="card-solid overflow-hidden"><div class="flex flex-col gap-4 border-b border-gray-100 bg-gradient-to-r from-[#F8F8FC] via-white to-[#F4F2FF] px-5 py-5 md:flex-row md:items-end md:justify-between md:px-6"><div class="min-w-0 md:flex-1"><p class="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Vote Results</p><h2 class="mt-3 text-2xl font-black text-[#2D2A4A] md:text-3xl">选题管理</h2></div><div class="flex max-w-full flex-col gap-2 sm:flex-row md:w-[19.75rem] md:shrink-0 md:items-center md:justify-end md:gap-2"><select data-vote-class-filter class="min-h-[44px] rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-black text-[#2D2A4A] outline-none md:h-10 md:min-h-0 md:w-[8rem] md:px-3.5 md:py-0 md:text-xs">' + stats + '</select><button data-vote-refresh-results class="inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-black text-[#6B48FF] shadow-sm active-scale md:h-10 md:min-h-0 md:w-[5rem] md:px-3 md:py-0 md:text-xs">' + (cfg.resultsLoading ? '<i class="fa-solid fa-spinner fa-spin mr-2 md:mr-1.5"></i>刷新中' : '<i class="fa-solid fa-rotate mr-2 md:mr-1.5"></i>刷新') + '</button><button data-vote-export class="inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-full bg-[#2D2A4A] px-4 py-2 text-sm font-black text-white active-scale md:h-10 md:min-h-0 md:w-[5rem] md:px-3 md:py-0 md:text-xs"><i class="fa-solid fa-file-arrow-down mr-2 md:mr-1.5"></i>导出</button></div></div>' + (cfg.resultsError ? '<div class="mx-5 mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-500 md:mx-6">' + esc(cfg.resultsError) + '</div>' : '') + '<div class="grid gap-3 px-5 py-5 md:grid-cols-3 md:px-6"><div class="rounded-[1.25rem] bg-[#F8F8FC] p-4"><p class="text-xs font-black uppercase tracking-[0.16em] text-gray-400">提交数</p><p class="mt-2 text-2xl font-black text-[#2D2A4A]">' + cfg.submissions.length + '</p></div><div class="rounded-[1.25rem] bg-[#F8F8FC] p-4"><p class="text-xs font-black uppercase tracking-[0.16em] text-gray-400">已占用题目</p><p class="mt-2 text-2xl font-black text-[#2D2A4A]">' + new Set(cfg.submissions.map(s => s.topicNumber)).size + '</p></div><div class="rounded-[1.25rem] bg-[#F8F8FC] p-4"><p class="text-xs font-black uppercase tracking-[0.16em] text-gray-400">当前筛选</p><p class="mt-2 text-2xl font-black text-[#2D2A4A]">' + filtered.length + '</p></div></div><div class="overflow-x-auto px-5 pb-6 md:px-6">' + (rows ? '<table class="w-full min-w-[980px] border-separate border-spacing-y-2"><thead><tr class="text-left text-xs font-black uppercase tracking-[0.16em] text-gray-400"><th class="px-4 py-2">题目</th><th class="px-4 py-2">学生</th><th class="px-4 py-2">问卷内容</th><th class="px-4 py-2">提交时间</th><th class="px-4 py-2">操作</th></tr></thead><tbody>' + rows + '</tbody></table>' : '<div class="rounded-[1.4rem] border border-dashed border-gray-200 bg-[#F8F8FC] px-5 py-8 text-center text-sm font-bold text-gray-400">' + (cfg.resultsLoading ? '正在读取选题记录...' : '暂无选题记录。') + '</div>') + '</div></section></div>';
}
function exportVoteCsv() {
  const cfg = voteCfg(); const rows = [['Topic','Title EN','Title ZH','Class','Student','Answers','Remarks','Submitted At']].concat(cfg.submissions.map(s => [s.topicNumber, s.topicTitleEn, s.topicTitleZh, s.studentClass, s.studentName, voteTemplate(s.topicType).map(f => f.labelZh + ':' + ((s.answers && s.answers[f.id]) || '')).join(' | '), s.remarks, s.submittedAt]));
  const csv = rows.map(r => r.map(v => '"' + String(v ?? '').replace(/"/g,'""') + '"').join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type:'text/csv;charset=utf-8' })); a.download = 'vote-submissions.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 500);
}
async function deleteVoteSubmission(id) {
  showConfirm('删除后该学生可以重新提交，占用的话题也会释放。', '删除这条选题记录？', '删除', 'bg-red-500 shadow-red-500/30', async () => {
    const { error } = await sb.from('vote_submissions').delete().eq('id', id);
    if (error) return toast('删除失败：' + voteErrorMessage(error));
    voteCfg().submissions = voteCfg().submissions.filter(s => s.id !== id);
    toast('已删除选题记录。');
    render();
  });
}
function render() {
  if (state.page === 'level') app.innerHTML = levelPage();
  else if (state.page === 'teacher') app.innerHTML = teacherPage();
  else if (state.page === 'vote') app.innerHTML = votePage();
  else app.innerHTML = homePage();
  initTeacherForm();
  hydrateStudentPetCollapse();
}
function initTeacherForm() {
  if (state.page !== 'teacher') return;
  if (state.teacherTab === 'students') {
    const idEl = document.getElementById('form-id');
    const pwdEl = document.getElementById('form-pwd');
    if (idEl && !idEl.value) {
      const ids = state.students.map(s => parseInt(String(s.id || '').replace(/^S/i, ''), 10)).filter(n => !Number.isNaN(n));
      const nextNum = ids.length ? Math.max(...ids) + 1 : 1;
      idEl.value = 'S' + String(nextNum).padStart(2, '0');
    }
    if (pwdEl && !pwdEl.value) regenPwd();
  }
  if (state.teacherTab === 'attendance' && !state.attendance) {
    state.attendance = attendanceDefaults();
  }
  if (state.teacherTab === 'attendance') {
    const cfg = attendanceCfg();
    if (!cfg.loaded && !cfg.loading) loadAttendanceRecords(false);
  }
  if (state.teacherTab === 'reports') {
    const cfg = reportCfg();
    if (!cfg.loaded && !cfg.loading) loadReportData(false);
  }
  if (state.teacherTab === 'pets') {
    const cfg = petCfg();
    if (!cfg.loaded && !cfg.loading) loadPetData(false);
  }
}
function showLogin() { modalRoot.innerHTML = '<div class="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"><div class="motion-auth-panel-enter w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-2xl"><h2 class="text-2xl font-black">登录</h2><input id="login-id" class="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 font-bold" placeholder="账号"><input id="login-pwd" type="password" class="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 font-bold" placeholder="密码"><button class="mt-5 w-full rounded-xl bg-[#5827fc] px-4 py-4 font-black text-white" data-do-login>进入</button><button class="mt-3 w-full rounded-xl bg-slate-100 px-4 py-4 font-black text-slate-500" data-close-modal>取消</button></div></div>'; }
function closeModal() { modalRoot.innerHTML = ''; }
async function doLogin() { const id = document.getElementById('login-id').value.trim(); const password = document.getElementById('login-pwd').value; if (id === TEACHER.id && password === TEACHER.password) { localStorage.setItem('xy_user', JSON.stringify({ id, role:'teacher', name:TEACHER.name })); state.pet = null; closeModal(); routeTo('teacher', null, true); return; } const result = await sb.from('students').select('*').eq('id', id.toUpperCase()).eq('password', password).maybeSingle(); if (result.error || !result.data) { toast('账号或密码不正确'); return; } localStorage.setItem('xy_user', JSON.stringify({ id:result.data.id, role:'student', name:result.data.name, classes:result.data.classes || [] })); state.pet = null; closeModal(); render(); }
function logout() { localStorage.removeItem('xy_user'); state.pet = null; routeTo('home', null, true); }
function regenPwd() { const el = document.getElementById('form-pwd'); if (el) el.value = Math.floor(1000 + Math.random() * 9000); }
function showStudentInfo(id) {
  const student = state.students.find(s => String(s.id) === String(id));
  if (!student) return showAlert('没有找到这个学生档案。', '学生信息');
  const classLabels = classesOf(student).map(code => teacherClasses().find(c => c.code === code)?.name || code);
  const row = (label, value, icon) => '<div class="rounded-2xl bg-[#F8F8FC] px-5 py-4 text-left"><p class="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400"><i class="fa-solid ' + icon + ' mr-2 text-[#6B48FF]"></i>' + label + '</p><p class="mt-2 break-words text-base font-black text-[#2D2A4A]">' + esc(value || '--') + '</p></div>';
  modalRoot.innerHTML = '<div class="fixed inset-0 z-[9999] flex items-center justify-center p-4"><div class="absolute inset-0 bg-black/40 backdrop-blur-sm" data-close-modal></div><div class="relative z-10 w-full max-w-md rounded-[32px] bg-white p-7 shadow-2xl motion-auth-panel-enter"><div class="mb-6 text-center"><div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F4F2FF] text-[#6B48FF]"><i class="fa-solid fa-user-graduate text-2xl"></i></div><h3 class="text-[24px] font-black text-[#2D2A4A]">' + esc(student.name) + '</h3><p class="mt-1 text-sm font-bold text-gray-400">学生档案信息</p></div><div class="space-y-3">' + row('ID', student.id, 'fa-id-card') + row('Password', student.password, 'fa-key') + row('Classes', classLabels.join(' / '), 'fa-layer-group') + '</div><button data-close-modal class="mt-6 w-full rounded-2xl bg-[#6B48FF] py-4 text-base font-bold text-white shadow-lg shadow-[#6B48FF]/30 active-scale">关闭</button></div></div>';
}
async function addStudent() {
  const id = (document.getElementById('form-id')?.value || '').trim().toUpperCase() || ('S' + Date.now().toString().slice(-6));
  const password = (document.getElementById('form-pwd')?.value || '').trim() || Math.floor(1000 + Math.random() * 9000).toString();
  const name = (document.getElementById('form-name')?.value || '').trim();
  const classes = Array.from(document.querySelectorAll('[data-toggle-chip].selected')).map(el => el.dataset.toggleChip);
  if (!name || classes.length === 0) return showAlert('请填写姓名并选择至少一个班级', '提示');
  showConfirm('将要给 ' + name + ' (' + id + ') 建立专属云端档案。', '添加学生', '确认添加', 'bg-[#2D2A4A] shadow-[#2D2A4A]/30', async () => {
    const result = await sb.from('students').insert({ id, password, name, classes });
    if (result.error) {
      if (result.error.code === '23505') return showAlert('账号 ' + id + ' 已存在，请修改 ID 后再试。', '账号重复');
      return showAlert('添加失败: ' + result.error.message, '错误');
    }
    await loadData();
    showAlert('账号：' + id + '\n密码：' + password + '\n\n该学生现在可以正常登录了！', '添加成功');
  });
}
async function deleteStudent(id) { showConfirm('确定要删除学生 ' + id + ' 的云端档案吗？', '删除学生', '确认删除', 'bg-red-500 shadow-red-500/30', async () => { const result = await sb.from('students').delete().eq('id', id); if (result.error) return showAlert(result.error.message, '错误'); await loadData(); }); }
function updateHomeworkState(record) {
  const index = state.homework.findIndex(h => h.id === record.id);
  if (index >= 0) state.homework[index] = { ...state.homework[index], ...record };
  else state.homework.unshift(record);
}
function homeworkPayload(id, status, fallback) {
  const found = moduleWithLevel(id);
  const existing = state.homework.find(h => h.id === id);
  const source = fallback || existing || {};
  if (!found && !existing && !fallback) return null;
  const module = found ? found.module : source;
  const classCode = normalizeClass(found ? found.levelId : (source.classCode || existing?.classCode || ''));
  const unit = source.unit || (found ? module.unitCode : module.unit) || 'Unit';
  const title = source.title || module.title || id;
  const file = normalizeLessonFile(source.file || existing?.file || (found ? module.localPath : module.file) || '');
  const date = new Date().toISOString();
  return {
    db:{ id, class_code:dbClass(classCode), unit, title, date, file, status },
    state:{ id, classCode, unit, title, date, file, status }
  };
}
async function syncLesson(id, status, control) {
  const payload = homeworkPayload(id, status);
  if (!payload) return;
  const previousChecked = control ? !control.checked : null;
  if (control) control.disabled = true;
  const result = await sb.from('homework').upsert(payload.db);
  if (control) control.disabled = false;
  if (result.error) {
    if (control) control.checked = previousChecked;
    return showAlert('同步失败: ' + result.error.message, '错误');
  }
  updateHomeworkState(payload.state);
  const countEl = document.getElementById('ui-hw-count');
  if (countEl) countEl.textContent = displayHomework().filter(h => h.status === 'open').length;
  toast('已同步');
}
async function addHomework() {
  const classCode = document.getElementById('hw-class').value;
  const unit = document.getElementById('hw-unit').value.trim();
  const title = document.getElementById('hw-title').value.trim();
  const uploadInput = document.getElementById('hw-upload');
  const uploadFile = uploadInput && uploadInput.files ? uploadInput.files[0] : null;
  let file = document.getElementById('hw-file').value.trim();
  if (!unit || !title || (!file && !uploadFile)) return showAlert('请填写单元、标题，并上传 HTML 文件或填写已有链接/路径。', '提示');
  const id = lessonRecordId(classCode, unit, title);
  const btn = document.getElementById('btn-add-hw');
  const previousLabel = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = uploadFile ? '正在上传...' : '正在保存...'; btn.classList.add('opacity-70'); }
  try {
    if (uploadFile) file = (await uploadLessonFile(classCode, id, uploadFile)).file;
    const savedFile = isAbsoluteUrl(file) ? file.trim() : normalizeLessonFile(file);
    const result = await sb.from('homework').upsert({ id, class_code:dbClass(classCode), unit, title, date:new Date().toISOString(), file:savedFile, status:'open' });
    if (result.error) throw new Error('保存失败: ' + result.error.message);
    await loadData();
    showAlert(uploadFile ? '课程文件已上传并发布，学生端单元列表会自动显示。' : '课程路径已保存，学生端单元列表会自动显示。', '保存完成');
  } catch (err) {
    showAlert(err.message || String(err), '错误');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = previousLabel || '上传并发布课程'; btn.classList.remove('opacity-70'); }
  }
}
async function migrateRegistryLessonsToStorage() {
  const btn = document.getElementById('btn-migrate-lessons');
  const previousLabel = btn ? btn.textContent : '';
  const modules = orderedLevels().flatMap(level => modulesByLevel(level.id).map(m => ({ level, module:m })));
  if (!modules.length) return showAlert('没有找到可同步的内置课程。', '提示');
  showConfirm('将把当前内置课程页面上传到 Supabase Storage，并把课程记录写入 homework 表。\n\n已有同 ID 课程只会更新后端文件链接，标题、单元编号、所属班级和开放状态都会保留。', '同步内置课程', '开始同步', 'bg-[#6B48FF] shadow-[#6B48FF]/30', async () => {
    const errors = [];
    let success = 0;
    if (btn) { btn.disabled = true; btn.textContent = '同步中 0/' + modules.length; btn.classList.add('opacity-70'); }
    try {
      for (let i = 0; i < modules.length; i++) {
        const { level, module:m } = modules[i];
        if (btn) btn.textContent = '同步中 ' + i + '/' + modules.length;
        try {
          const sourcePath = 'classes/' + normalizeLessonFile(m.localPath);
          const response = await fetch(sourcePath, { cache:'no-store' });
          if (!response.ok) throw new Error('读取本地课程失败：' + response.status);
          const blob = await response.blob();
          const lessonFile = new File([blob], m.id + '.html', { type:'text/html' });
          const existing = state.homework.find(h => h.id === m.id);
          if (existing && existing.status === 'deleted') continue;
          const oldPath = existing ? storagePathFromLessonFile(existing.file) : '';
          const uploaded = await uploadLessonFile(level.id, m.id, lessonFile);
          const result = await sb.from('homework').upsert({
            id:m.id,
            class_code:existing && existing.classCode ? dbClass(normalizeClass(existing.classCode)) : dbClass(level.id),
            unit:existing && existing.unit ? existing.unit : (m.unitCode || 'Unit'),
            title:existing && existing.title ? existing.title : m.title,
            date:new Date().toISOString(),
            file:uploaded.file,
            status:existing && existing.status ? existing.status : (m.isReady ? 'open' : 'closed')
          });
          if (result.error) throw new Error(result.error.message);
          if (oldPath && oldPath !== uploaded.path) await sb.storage.from(LESSON_UPLOAD_BUCKET).remove([oldPath]);
          success++;
        } catch (err) {
          errors.push((m.title || m.id) + ': ' + (err.message || String(err)));
        }
      }
      await loadData();
      showAlert('同步完成：' + success + '/' + modules.length + ' 个课程已准备到后端。' + (errors.length ? '\n\n失败项：\n' + errors.slice(0, 8).join('\n') + (errors.length > 8 ? '\n...' : '') : ''), errors.length ? '部分完成' : '同步完成');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = previousLabel || '同步内置课程到后端'; btn.classList.remove('opacity-70'); }
    }
  });
}
function showHomeworkEditor(id) {
  const hw = displayHomework().find(h => h.id === id);
  if (!hw) return showAlert('没有找到这条课程记录。', '无法编辑');
  const currentClass = normalizeClass(hw.classCode);
  const classOptions = teacherClasses().map(c => '<option value="' + esc(c.code) + '" ' + (currentClass === c.code ? 'selected' : '') + '>' + esc(c.name) + '</option>').join('');
  modalRoot.innerHTML = '<div class="fixed inset-0 z-[9999] flex items-center justify-center p-4"><div class="absolute inset-0 bg-black/40 backdrop-blur-sm" data-close-modal></div><div class="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl motion-auth-panel-enter md:p-8"><div class="mb-6 flex items-start justify-between gap-4"><div><p class="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">Course Editor</p><h3 class="mt-2 text-[24px] font-black text-[#2D2A4A]">编辑课程</h3></div><button data-close-modal class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8F8FC] text-gray-400 active-scale"><i class="fa-solid fa-xmark"></i></button></div><input type="hidden" id="edit-hw-id" value="' + esc(hw.id) + '"><div class="grid gap-5 md:grid-cols-2"><label><span class="mb-2 ml-1 block text-[11px] font-bold uppercase text-gray-400 md:text-[13px]">班级</span><select id="edit-hw-class" class="w-full rounded-xl border border-gray-200 bg-[#F8F8FC] px-5 py-4 text-base font-bold text-[#6B48FF] outline-none">' + classOptions + '</select></label><label><span class="mb-2 ml-1 block text-[11px] font-bold uppercase text-gray-400 md:text-[13px]">状态</span><select id="edit-hw-status" class="w-full rounded-xl border border-gray-200 bg-[#F8F8FC] px-5 py-4 text-base font-bold text-[#6B48FF] outline-none"><option value="open" ' + (hw.status === 'open' ? 'selected' : '') + '>开放</option><option value="closed" ' + (hw.status === 'closed' ? 'selected' : '') + '>隐藏/关闭</option></select></label><label><span class="mb-2 ml-1 block text-[11px] font-bold uppercase text-gray-400 md:text-[13px]">单元</span><input id="edit-hw-unit" value="' + esc(hw.unit || '') + '" class="w-full rounded-xl border border-gray-200 bg-[#F8F8FC] px-5 py-4 text-base font-medium outline-none"></label><label><span class="mb-2 ml-1 block text-[11px] font-bold uppercase text-gray-400 md:text-[13px]">标题</span><input id="edit-hw-title" value="' + esc(hw.title || '') + '" class="w-full rounded-xl border border-gray-200 bg-[#F8F8FC] px-5 py-4 text-base font-medium outline-none"></label></div><label class="mt-5 block"><span class="mb-2 ml-1 block text-[11px] font-bold uppercase text-gray-400 md:text-[13px]">当前链接/路径</span><input id="edit-hw-file" value="' + esc(normalizeLessonFile(hw.file || '')) + '" class="w-full rounded-xl border border-gray-200 bg-[#F8F8FC] px-5 py-4 text-base font-medium outline-none"></label><label class="mt-5 block"><span class="mb-2 ml-1 block text-[11px] font-bold uppercase text-gray-400 md:text-[13px]">替换 HTML 文件（可选）</span><input id="edit-hw-upload" type="file" accept=".html,text/html" class="w-full rounded-xl border border-dashed border-[#C9C3FF] bg-[#F8F8FC] px-5 py-4 text-sm font-bold text-[#2D2A4A] file:mr-4 file:rounded-full file:border-0 file:bg-[#6B48FF] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"><p class="mt-2 px-1 text-[12px] font-medium leading-5 text-gray-400">选择新文件后会替换课程链接；若旧文件位于 ' + LESSON_UPLOAD_BUCKET + '，保存成功后会同步删除旧文件。</p></label><div class="mt-7 flex flex-col gap-3 sm:flex-row"><button data-close-modal class="flex-1 rounded-2xl bg-gray-100 py-4 text-base font-bold text-gray-600 active-scale">取消</button><button id="btn-save-hw-edit" data-save-homework-edit class="flex-1 rounded-2xl bg-[#6B48FF] py-4 text-base font-bold text-white shadow-lg shadow-[#6B48FF]/30 active-scale">保存修改</button></div></div></div>';
}
async function saveHomeworkEdit() {
  const id = document.getElementById('edit-hw-id').value;
  const old = displayHomework().find(h => h.id === id);
  if (!old) return showAlert('没有找到这条课程记录。', '无法保存');
  const classCode = document.getElementById('edit-hw-class').value;
  const unit = document.getElementById('edit-hw-unit').value.trim();
  const title = document.getElementById('edit-hw-title').value.trim();
  const status = document.getElementById('edit-hw-status').value;
  const uploadInput = document.getElementById('edit-hw-upload');
  const uploadFile = uploadInput && uploadInput.files ? uploadInput.files[0] : null;
  let file = document.getElementById('edit-hw-file').value.trim();
  if (!unit || !title || (!file && !uploadFile)) return showAlert('请填写班级、单元、标题，并保留或替换课程文件。', '提示');
  const btn = document.getElementById('btn-save-hw-edit');
  if (btn) { btn.disabled = true; btn.textContent = uploadFile ? '正在替换...' : '正在保存...'; btn.classList.add('opacity-70'); }
  const oldPath = storagePathFromLessonFile(old.file);
  const scrollPos = captureHomeworkScroll();
  try {
    if (uploadFile) {
      const uploaded = await uploadLessonFile(classCode, id, uploadFile);
      file = uploaded.file;
    }
    const savedFile = isAbsoluteUrl(file) ? file.trim() : normalizeLessonFile(file);
    const result = await sb.from('homework').upsert({ id, class_code:dbClass(classCode), unit, title, date:new Date().toISOString(), file:savedFile, status });
    if (result.error) throw new Error('保存失败: ' + result.error.message);
    const nextPath = storagePathFromLessonFile(savedFile);
    if (oldPath && oldPath !== nextPath) {
      const removed = await sb.storage.from(LESSON_UPLOAD_BUCKET).remove([oldPath]);
      if (removed.error) toast('课程已保存，但旧文件删除失败：' + removed.error.message);
    }
    closeModal();
    await loadData();
    restoreHomeworkScroll(scrollPos);
    showAlert(uploadFile ? '课程已更新，新文件已替换。' : '课程信息已更新。', '保存完成');
  } catch (err) {
    showAlert(err.message || String(err), '错误');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '保存修改'; btn.classList.remove('opacity-70'); }
  }
}
async function deleteHomework(id) {
  const found = moduleWithLevel(id);
  const hw = displayHomework().find(h => h.id === id);
  const storagePath = hw ? storagePathFromLessonFile(hw.file) : '';
  const msg = found ? '确定删除这条内置课程吗？\n\n系统会记录删除标记，避免它被本地注册表自动补回；如果它有后端 HTML 文件，也会同步清理。' : (storagePath ? '确定删除这条课程记录吗？\n\n会同时删除 Supabase Storage 中的 HTML 文件，学生端将不再显示。' : '确定删除这条课程记录吗？学生端将不再读取这条自定义发布记录。');
  showConfirm(msg, '删除课程', '确认删除', 'bg-red-500 shadow-red-500/30', async () => {
    const result = found
      ? await sb.from('homework').upsert({ id, class_code:dbClass(found.levelId), unit:found.module.unitCode || 'Unit', title:found.module.title, date:new Date().toISOString(), file:'', status:'deleted' })
      : await sb.from('homework').delete().eq('id', id);
    if (result.error) return showAlert('删除失败: ' + result.error.message, '错误');
    if (storagePath) {
      const removed = await sb.storage.from(LESSON_UPLOAD_BUCKET).remove([storagePath]);
      if (removed.error) return showAlert('课程记录已删除，但 Storage 文件删除失败：' + removed.error.message, '部分完成');
    }
    await loadData();
    showAlert('课程已删除。', '删除完成');
  });
}
async function closeAllOldHw() {
  showConfirm('确定要一键关闭所有已经发布的旧作业吗？\n\n会把当前后台列表里所有可见课程都写入后端关闭状态，避免内置课程刷新后又自动开放。', '一键关闭旧作业', '确认关闭', 'bg-red-500 shadow-red-500/30', async () => {
    const rows = displayHomework().filter(h => h.status !== 'deleted');
    const payloads = rows.map(h => homeworkPayload(h.id, 'closed', h)).filter(Boolean);
    if (!payloads.length) return showAlert('没有找到可关闭的作业。', '提示');
    const result = await sb.from('homework').upsert(payloads.map(p => p.db));
    if (result.error) return showAlert('关闭失败: ' + result.error.message, '错误');
    payloads.forEach(p => updateHomeworkState(p.state));
    document.querySelectorAll('[data-toggle-lesson]').forEach(el => { el.checked = false; });
    const countEl = document.getElementById('ui-hw-count');
    if (countEl) countEl.textContent = '0';
    render();
    showAlert('所有旧作业已成功收回封闭。', '清理完成');
  });
}
function showBannerPreview(id) {
  const b = state.banners.find(item => String(item.id) === String(id));
  const slide = b ? bannerSlide(b) : SLIDES.find(item => String(item[6]) === String(id));
  if (!slide) return showAlert('没有找到这张宣传图。', '预览');
  const link = b ? b.link : slide[5];
  modalRoot.innerHTML = '<div class="fixed inset-0 z-[9999] flex items-center justify-center p-4"><div class="absolute inset-0 bg-black/40 backdrop-blur-sm" data-close-modal></div><div class="relative z-10 w-full max-w-3xl rounded-[32px] bg-white p-4 shadow-2xl motion-auth-panel-enter md:p-5"><div class="relative aspect-[16/9] overflow-hidden rounded-[2rem] bg-[#5827fc] p-7 text-left text-white md:aspect-[21/8] md:p-10" style="background-image:' + esc(slide[3]) + ';background-size:cover;background-position:' + esc(slide[4]) + '"><div class="relative z-10 max-w-[20rem] space-y-3"><span class="inline-block rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">' + esc(slide[0]) + '</span><h2 class="text-[clamp(1.15rem,5.2vw,1.65rem)] font-extrabold leading-[1.3] md:text-2xl">' + slide[1].map(line => '<span class="block whitespace-nowrap">' + esc(line) + '</span>').join('') + '</h2><p class="max-w-[285px] text-sm leading-5 text-white/90">' + esc(slide[2]) + '</p></div></div><div class="mt-4 flex flex-col gap-3 sm:flex-row"><button data-close-modal class="flex-1 rounded-2xl bg-gray-100 py-4 text-base font-bold text-gray-600 active-scale">关闭</button>' + (link ? '<a href="' + esc(link) + '" target="_blank" rel="noopener noreferrer" class="flex-1 rounded-2xl bg-[#6B48FF] py-4 text-center text-base font-bold text-white shadow-lg shadow-[#6B48FF]/30 active-scale">打开跳转链接</a>' : '') + '</div></div></div>';
}
async function uploadBannerFile(prefix) {
  const input = document.getElementById(prefix + '-upload');
  const file = input && input.files ? input.files[0] : null;
  if (!file) return '';
  if (!/^image\//i.test(file.type || '')) throw new Error('只能上传图片文件。');
  const ext = (file.name.match(/\.[a-z0-9]+$/i) || ['.jpg'])[0].toLowerCase();
  const path = 'home/' + Date.now() + '-' + shortHash(file.name + '|' + file.size) + ext;
  const upload = await sb.storage.from(BANNER_UPLOAD_BUCKET).upload(path, file, { contentType:file.type || 'image/jpeg', upsert:false });
  if (upload.error) throw new Error('图片上传失败: ' + upload.error.message + '。请确认已执行 supabase-banner-setup.sql 并创建公开 bucket "' + BANNER_UPLOAD_BUCKET + '"。');
  const publicUrl = sb.storage.from(BANNER_UPLOAD_BUCKET).getPublicUrl(path);
  return publicUrl && publicUrl.data ? publicUrl.data.publicUrl : '';
}
async function bannerFormPayload(prefix) {
  const uploaded = await uploadBannerFile(prefix);
  const image = uploaded || document.getElementById(prefix + '-img')?.value.trim() || '';
  const link = document.getElementById(prefix + '-link')?.value.trim() || '';
  const tag = document.getElementById(prefix + '-tag')?.value.trim() || 'NEW';
  const title = document.getElementById(prefix + '-title')?.value.trim() || '';
  const subtitle = document.getElementById(prefix + '-subtitle')?.value.trim() || '点击查看详情。';
  const position = document.getElementById(prefix + '-position')?.value.trim() || 'center';
  const existingId = document.getElementById('edit-ban-id')?.value || '';
  const existing = existingId ? state.banners.find(b => String(b.id) === String(existingId)) : null;
  const sortOrder = existing ? Number(existing.sort_order) : Math.max(1, ...state.banners.map(b => Number(b.sort_order) || 0)) + 1;
  const status = document.getElementById(prefix + '-status')?.value || 'open';
  if (!image || !title) throw new Error('图片和标题必填。');
  if (!isAbsoluteUrl(image)) throw new Error('图片必须使用可公开访问的 http/https 直链。');
  if (link && !isAbsoluteUrl(link)) throw new Error('跳转链接需要使用 http/https 开头，或留空。');
  return { image, link, tag, title, subtitle, position, sort_order:Number.isFinite(sortOrder) ? sortOrder : 1, status };
}
function showBannerEditor(id) {
  const b = state.banners.find(item => String(item.id) === String(id));
  if (!b) return showAlert('只能编辑已发布的主页卡片。内置默认卡片请通过新增卡片覆盖展示。', '提示');
  modalRoot.innerHTML = '<div class="fixed inset-0 z-[9999] flex items-center justify-center p-4"><div class="absolute inset-0 bg-black/40 backdrop-blur-sm" data-close-modal></div><div class="relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl motion-auth-panel-enter md:p-8"><div class="mb-6 flex items-start justify-between gap-4"><div><p class="text-[11px] font-black uppercase tracking-[0.22em] text-[#6B48FF]">Home Banner</p><h3 class="mt-1 text-[22px] font-black text-[#2D2A4A]">编辑主页卡片</h3></div><button data-close-modal class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 active-scale" aria-label="关闭"><i class="fa-solid fa-xmark"></i></button></div><div class="mb-5 overflow-hidden rounded-2xl bg-gray-100"><img src="' + esc(b.image) + '" class="h-40 w-full object-cover" alt="当前宣传图预览"></div><input type="hidden" id="edit-ban-id" value="' + esc(b.id) + '">' + bannerForm('edit-ban', b) + '<div class="flex flex-col gap-3 sm:flex-row"><button data-close-modal class="flex-1 rounded-2xl bg-gray-100 py-4 text-base font-bold text-gray-600 active-scale">取消</button><button id="btn-save-ban" data-save-banner-edit class="flex-1 rounded-2xl bg-[#6B48FF] py-4 text-base font-bold text-white shadow-lg shadow-[#6B48FF]/30 active-scale">保存修改</button></div></div></div>';
}
async function saveBannerEdit() {
  const id = document.getElementById('edit-ban-id')?.value;
  if (!id) return showAlert('没有找到要编辑的卡片。', '错误');
  let payload;
  const btn = document.getElementById('btn-save-ban');
  if (btn) { btn.disabled = true; btn.textContent = '正在保存...'; btn.classList.add('opacity-70'); }
  try {
    payload = await bannerFormPayload('edit-ban');
    const result = await sb.from('banners').update(payload).eq('id', id);
    if (result.error) throw new Error(result.error.message);
    closeModal();
    state.slide = 0;
    await loadData();
    showAlert('主页卡片已更新。', '保存完成');
  } catch (err) {
    showAlert(err.message || String(err), '错误');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '保存修改'; btn.classList.remove('opacity-70'); }
  }
}
async function addBanner() {
  let payload;
  const btn = document.getElementById('btn-add-ban');
  if (btn) { btn.disabled = true; btn.textContent = '正在发布...'; btn.classList.add('opacity-70'); }
  try {
    payload = await bannerFormPayload('ban');
    const result = await sb.from('banners').insert({ id:'ban_' + Date.now(), ...payload });
    if (result.error) throw new Error(result.error.message);
    state.slide = 0;
    await loadData();
    showAlert('宣传图已发布到首页轮播。', '发布完成');
  } catch (err) {
    showAlert(err.message || String(err), '错误');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '新增并发布到主页轮播'; btn.classList.remove('opacity-70'); }
  }
}
async function deleteBanner(id) { showConfirm('确定要从主页删除这张宣传图吗？', '删除宣传图', '确认删除', 'bg-red-500 shadow-red-500/30', async () => { const result = await sb.from('banners').delete().eq('id', id); if (result.error) return showAlert(result.error.message, '错误'); state.slide = 0; await loadData(); showAlert('主页卡片已删除。', '删除完成'); }); }
async function updateBannerStatus(id, checked, el) {
  const next = checked ? 'open' : 'closed';
  const prev = state.banners.find(b => String(b.id) === String(id))?.status || 'open';
  const switchEl = el ? el.closest('.banner-switch') : null;
  state.banners = state.banners.map(b => String(b.id) === String(id) ? { ...b, status:next } : b);
  if (switchEl) switchEl.classList.toggle('is-open', checked);
  const result = await sb.from('banners').update({ status:next }).eq('id', id);
  if (result.error) {
    state.banners = state.banners.map(b => String(b.id) === String(id) ? { ...b, status:prev } : b);
    if (el) el.checked = prev !== 'closed';
    if (switchEl) switchEl.classList.toggle('is-open', prev !== 'closed');
    return showAlert('更新显示状态失败: ' + result.error.message, '错误');
  }
}
function reorderBannersInState(fromId, toIdOrIndex) {
  if (!fromId && fromId !== 0) return null;
  const ordered = (state.banners || []).slice().sort((a,b) => (Number(a.sort_order) || 999) - (Number(b.sort_order) || 999));
  const from = ordered.findIndex(b => String(b.id) === String(fromId));
  const requestedTo = typeof toIdOrIndex === 'number' ? toIdOrIndex : ordered.findIndex(b => String(b.id) === String(toIdOrIndex));
  const to = Math.max(0, Math.min(ordered.length - 1, requestedTo));
  if (from < 0 || to < 0) return null;
  if (from === to) return ordered.map((b, i) => ({ ...b, sort_order:i + 1 }));
  const [moved] = ordered.splice(from, 1);
  ordered.splice(to, 0, moved);
  return ordered.map((b, i) => ({ ...b, sort_order:i + 1 }));
}
async function persistBannerOrder(ordered) {
  const updates = ordered.map(b => sb.from('banners').update({ sort_order:b.sort_order }).eq('id', b.id));
  const results = await Promise.all(updates);
  const error = results.find(r => r.error)?.error;
  if (error) {
    await loadData();
    return showAlert('保存页数排序失败: ' + error.message, '错误');
  }
}
async function shiftBannerPage(id, delta) {
  const ordered = (state.banners || []).slice().sort((a,b) => (Number(a.sort_order) || 999) - (Number(b.sort_order) || 999));
  const index = ordered.findIndex(b => String(b.id) === String(id));
  if (index < 0) return showAlert('没有找到这张宣传图。', '排序失败');
  const target = Math.max(0, Math.min(ordered.length - 1, index + Number(delta || 0)));
  if (target === index) return;
  const next = reorderBannersInState(id, target);
  if (!next) return;
  state.banners = next;
  state.slide = 0;
  render();
  await persistBannerOrder(next);
}
async function loadAttendanceRecords(showDone = false) {
  const cfg = attendanceCfg();
  const start = attendanceBoundary(cfg.startDate, false);
  const end = attendanceBoundary(cfg.endDate, true);
  if (!start || !end || start > end) { cfg.error = '请检查开始日期和结束日期'; cfg.records = []; cfg.loading = false; cfg.loaded = true; render(); return; }
  const requestId = ++attendanceRequestSeq;
  cfg.loading = true;
  cfg.loaded = true;
  cfg.error = '';
  render();
  const exemptQuery = sb.from('attendance_records').select('*').eq('class_code', dbClass(cfg.classCode)).lte('start_at', end.toISOString()).gte('end_at', start.toISOString()).order('start_at', { ascending:false });
  const submissionQuery = sb.from('growth_logs').select('*').gte('created_at', start.toISOString()).lte('created_at', end.toISOString()).order('created_at', { ascending:false });
  const [exemptResult, submissionResult] = await Promise.all([
    withTimeout(exemptQuery, 10000, '豁免记录读取超时，请检查网络或确认 attendance_records 表已创建。'),
    withTimeout(submissionQuery, 10000, '提交记录读取超时，请检查网络或确认 growth_logs 表已创建。')
  ]);
  if (requestId !== attendanceRequestSeq) return;
  cfg.loading = false;
  if (exemptResult.error || submissionResult.error) {
    cfg.error = [exemptResult.error, submissionResult.error].filter(Boolean).map(e => e.message).join(' / ');
    cfg.records = [];
    cfg.submissions = [];
  } else {
    cfg.records = exemptResult.data || [];
    cfg.submissions = attendanceSubmissionsInRange(submissionResult.data || [], start, end);
  }
  render();
  if (showDone && !cfg.error) toast('打卡记录已刷新');
}
function updateAttendanceField(field, value) {
  const cfg = attendanceCfg();
  cfg[field] = value;
  if (field === 'classCode') cfg.selectedIds = [];
  if (['classCode','startDate','endDate'].includes(field)) cfg.loaded = false;
  render();
  if (['classCode','startDate','endDate'].includes(field)) loadAttendanceRecords(false);
}
function toggleAttendanceStudent(id, checked) {
  const cfg = attendanceCfg();
  const textId = String(id);
  cfg.selectedIds = checked ? Array.from(new Set([...(cfg.selectedIds || []), textId])) : (cfg.selectedIds || []).filter(item => String(item) !== textId);
  render();
}
function selectAllAttendanceStudents() {
  const cfg = attendanceCfg();
  cfg.selectedIds = attendanceClassStudents(cfg.classCode).map(s => String(s.id));
  render();
}
function clearAttendanceStudents() { attendanceCfg().selectedIds = []; render(); }
function attendancePickerRows() {
  const cfg = attendanceCfg();
  const students = attendanceClassStudents(cfg.classCode);
  const selected = new Set(cfg.selectedIds || []);
  return students.map(s => {
    const checked = selected.has(String(s.id));
    return '<button data-att-picker-toggle="' + esc(s.id) + '" class="grid w-full grid-cols-[2.5rem_minmax(0,1fr)_5rem] items-center gap-3 border-b border-gray-50 px-4 py-3 text-left transition last:border-0 active-scale ' + (checked ? 'bg-[#F4F2FF]' : 'bg-white hover:bg-[#F8F8FC]') + '"><span class="flex h-7 w-7 items-center justify-center rounded-full border text-xs ' + (checked ? 'border-[#6B48FF] bg-[#6B48FF] text-white' : 'border-gray-200 bg-white text-transparent') + '"><i class="fa-solid fa-check"></i></span><span class="min-w-0"><span class="block truncate text-sm font-black text-[#2D2A4A]">' + esc(s.name || s.id) + '</span><span class="mt-0.5 block font-mono text-xs font-bold text-gray-400">' + esc(s.id) + '</span></span><span class="justify-self-end rounded-full bg-[#F8F8FC] px-3 py-1 text-[11px] font-black text-gray-400">' + (checked ? '已选' : '选择') + '</span></button>';
  }).join('') || '<div class="px-5 py-10 text-center text-sm font-bold text-gray-400">该班级暂无学生</div>';
}
function refreshAttendancePicker() {
  const count = document.getElementById('att-picker-count');
  const list = document.getElementById('att-picker-list');
  if (count) count.textContent = attendanceCfg().selectedIds.length;
  if (list) list.innerHTML = attendancePickerRows();
}
function showAttendancePicker() {
  const cfg = attendanceCfg();
  const selected = new Set(cfg.selectedIds || []);
  const className = teacherClasses().find(c => c.code === cfg.classCode)?.name || cfg.classCode;
  modalRoot.innerHTML = '<div class="fixed inset-0 z-[9999] flex items-center justify-center p-4"><div class="absolute inset-0 bg-black/40 backdrop-blur-sm" data-close-att-picker></div><div class="relative z-10 flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl motion-auth-panel-enter"><div class="border-b border-gray-100 bg-gradient-to-r from-[#F8F8FC] via-white to-[#F4F2FF] p-6"><div class="flex items-start justify-between gap-4"><div><p class="text-xs font-black uppercase tracking-[0.24em] text-gray-400">Students</p><h3 class="mt-2 text-[24px] font-black text-[#2D2A4A]">选择豁免学生</h3><p class="mt-2 text-sm font-bold text-gray-400">' + esc(className) + '，已选择 <span id="att-picker-count">' + selected.size + '</span> 人</p></div><button data-close-att-picker class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm active-scale"><i class="fa-solid fa-xmark"></i></button></div><div class="mt-5 flex gap-2"><button data-att-picker-all class="min-h-[40px] rounded-full bg-[#6B48FF] px-4 py-2 text-xs font-black text-white shadow-lg shadow-[#6B48FF]/20 active-scale">全选当前班级</button><button data-att-picker-clear class="min-h-[40px] rounded-full bg-white px-4 py-2 text-xs font-black text-gray-500 shadow-sm active-scale">清空选择</button></div></div><div class="min-h-0 flex-1 overflow-y-auto bg-[#F8F8FC] p-3"><div id="att-picker-list" class="overflow-hidden rounded-[1.4rem] border border-gray-100 bg-white shadow-sm">' + attendancePickerRows() + '</div></div><div class="border-t border-gray-100 bg-white p-4"><button data-close-att-picker class="w-full rounded-2xl bg-[#2D2A4A] py-4 text-base font-bold text-white shadow-lg shadow-[#2D2A4A]/20 active-scale">完成</button></div></div></div>';
}
function toggleAttendancePickerStudent(id) {
  const cfg = attendanceCfg();
  const textId = String(id);
  cfg.selectedIds = (cfg.selectedIds || []).includes(textId) ? cfg.selectedIds.filter(item => item !== textId) : cfg.selectedIds.concat(textId);
  refreshAttendancePicker();
}
function pickerSelectAllAttendanceStudents() {
  const cfg = attendanceCfg();
  cfg.selectedIds = attendanceClassStudents(cfg.classCode).map(s => String(s.id));
  refreshAttendancePicker();
}
function pickerClearAttendanceStudents() {
  attendanceCfg().selectedIds = [];
  refreshAttendancePicker();
}
function closeAttendancePicker() {
  closeModal();
  render();
}
async function saveAttendance() {
  const cfg = attendanceCfg();
  const start = attendanceBoundary(cfg.startDate, false);
  const end = attendanceBoundary(cfg.endDate, true);
  if (!start || !end) return showAlert('请完整填写开始日期和结束日期', '提示');
  if (start > end) return showAlert('开始日期不能晚于结束日期', '提示');
  const students = attendancePayloadStudentRows();
  if (!students.length) return showAlert('请先选择需要豁免的学生。', '提示');
  const reason = String(cfg.note || '').trim();
  if (!reason) return showAlert('请填写豁免原因。', '提示');
  const btn = document.getElementById('btn-att-save');
  const original = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>保存中'; }
  try {
    const classCode = dbClass(cfg.classCode);
    const ids = students.map(s => String(s.id));
    const rows = students.map(s => ({
      class_code: classCode,
      student_id: s.id,
      student_name: s.name || '',
      status: 'present',
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      note: '豁免：' + reason,
      created_by: TEACHER.id
    }));
    const removed = await sb.from('attendance_records').delete().eq('class_code', classCode).eq('start_at', start.toISOString()).eq('end_at', end.toISOString()).in('student_id', ids);
    if (removed.error) return showAlert('更新旧豁免失败: ' + removed.error.message, '错误');
    const result = await sb.from('attendance_records').insert(rows);
    if (result.error) return showAlert('保存豁免失败: ' + result.error.message + '\n\n如果这是第一次使用，请先执行 supabase-attendance-setup.sql。', '错误');
    cfg.selectedIds = [];
    cfg.note = '';
    await loadAttendanceRecords(false);
    toast('已应用豁免：' + rows.length + ' 人');
  } catch (err) {
    showAlert('保存豁免失败: ' + (err.message || String(err)), '错误');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = original; }
  }
}
async function deleteAttendance(id) {
  showConfirm('确定删除这条豁免记录吗？删除后该学生会重新按作业提交情况判定。', '删除豁免', '确认删除', 'bg-red-500 shadow-red-500/30', async () => {
    const result = await sb.from('attendance_records').delete().eq('id', id);
    if (result.error) return showAlert('删除失败: ' + result.error.message, '错误');
    const cfg = attendanceCfg();
    cfg.records = (cfg.records || []).filter(r => String(r.id) !== String(id));
    render();
    toast('豁免记录已删除');
  });
}
async function fetchOptionalTable(table, select, dateColumn, cfg) {
  const rows = [];
  let from = 0;
  while (true) {
    let query = sb.from(table).select(select).order(dateColumn, { ascending:false }).range(from, from + 999);
    const start = cfg && cfg.startDate ? reportBoundary(cfg.startDate, false) : null;
    const end = cfg && cfg.endDate ? reportBoundary(cfg.endDate, true) : null;
    if (start) query = query.gte(dateColumn, start.toISOString());
    if (end) query = query.lte(dateColumn, end.toISOString());
    const result = await query;
    if (result.error) {
      const msg = String(result.error.message || '').toLowerCase();
      if (result.error.code === '42P01' || result.error.code === 'PGRST205' || msg.includes(table)) return { data:[], missing:true, error:null };
      return { data:[], missing:false, error:result.error };
    }
    const batch = result.data || [];
    rows.push(...batch);
    if (batch.length < 1000) break;
    from += 1000;
  }
  return { data:rows, missing:false, error:null };
}
async function loadReportData(showDone = true) {
  const cfg = reportCfg();
  cfg.loading = true;
  cfg.error = '';
  render();
  const logs = await fetchOptionalTable('growth_logs', '*', 'created_at', cfg);
  const errors = [logs.error].filter(Boolean);
  if (errors.length) cfg.error = errors.map(e => e.message).join(' / ');
  cfg.quizAttempts = [];
  cfg.diagnosticAttempts = [];
  if (!logs.error) state.logs = logs.data || state.logs;
  cfg.loaded = true;
  cfg.loading = false;
  render();
  if (showDone) toast('报表数据已同步');
}
function updateReportField(field, value) {
  const cfg = reportCfg();
  cfg[field] = value;
  if (field === 'selectedLevelId') cfg.selectedLessonId = 'all';
  if (['selectedLevelId','selectedLessonId','sourceFilter','viewMode','startDate','endDate'].includes(field)) cfg.selectedComparisonIds = [];
  render();
  if (field === 'startDate' || field === 'endDate') loadReportData(false);
}
function toggleReportCompare(entityId) {
  const cfg = reportCfg();
  const data = computeReports();
  const current = cfg.selectedComparisonIds.length ? cfg.selectedComparisonIds.slice() : data.selected.slice();
  if (current.includes(entityId)) cfg.selectedComparisonIds = current.filter(id => id !== entityId);
  else if (current.length >= 5) return showAlert('为了图表清晰，最多支持同时对比 5 个对象。', '提示');
  else cfg.selectedComparisonIds = current.concat(entityId);
  render();
}
async function createPetForStudent(studentId, type, name) {
  const cleanName = String(name || '').trim();
  if (!studentId || !cleanName) return showAlert('请填写宠物名字。', '提示');
  const result = await sb.rpc('initialize_student_pet', { p_student_id:String(studentId), p_pet_type:type || 'fox', p_pet_name:cleanName });
  if (result.error) return showAlert(petErrorMessage(result.error), '宠物创建失败');
  petCfg().activeStudentId = String(studentId);
  await loadPetData(false);
  toast('宠物已创建。');
}
async function saveStudentPet(studentId, source) {
  const pet = petForStudent(studentId);
  if (!pet) return;
  const root = source?.closest('[data-pet-student-panel]') || document;
  const payload = {
    pet_name:(root.querySelector('[data-pet-admin-name]')?.value || document.getElementById('pet-admin-name')?.value || pet.pet_name).trim() || pet.pet_name,
    is_visible:(root.querySelector('[data-pet-admin-visible]')?.value || document.getElementById('pet-admin-visible')?.value) !== 'false',
    experience_points:Math.max(0, Number(root.querySelector('[data-pet-admin-xp]')?.value || document.getElementById('pet-admin-xp')?.value || 0)),
    pet_points:Math.max(0, Number(root.querySelector('[data-pet-admin-points]')?.value || document.getElementById('pet-admin-points')?.value || 0)),
    level_mode:(root.querySelector('[data-pet-admin-level-mode]')?.value || document.getElementById('pet-admin-level-mode')?.value) === 'manual' ? 'manual' : 'auto',
    manual_level:Number(root.querySelector('[data-pet-admin-manual-level]')?.value || document.getElementById('pet-admin-manual-level')?.value || pet.manual_level || 1)
  };
  const result = await sb.from('student_pets').update(payload).eq('student_id', String(studentId));
  if (result.error) return showAlert(petErrorMessage(result.error), '保存失败');
  petCfg().activeStudentId = String(studentId);
  await loadPetData(false);
  toast('宠物档案已保存。');
}
async function adjustStudentPet(studentId, source) {
  const root = source?.closest('[data-pet-student-panel]') || document;
  const xp = Number(root.querySelector('[data-pet-adjust-xp]')?.value || document.getElementById('pet-adjust-xp')?.value || 0);
  const points = Number(root.querySelector('[data-pet-adjust-points]')?.value || document.getElementById('pet-adjust-points')?.value || 0);
  const reason = (root.querySelector('[data-pet-adjust-reason]')?.value || document.getElementById('pet-adjust-reason')?.value || '教师补偿').trim();
  if (!xp && !points) return showAlert('请填写要调整的经验或积分。', '提示');
  const result = await sb.rpc('admin_adjust_pet', { p_target_student_id:String(studentId), p_xp_delta:xp, p_point_delta:points, p_reason:reason });
  if (result.error) return showAlert(petErrorMessage(result.error), '调整失败');
  petCfg().activeStudentId = String(studentId);
  await loadPetData(false);
  toast('宠物补偿已应用。');
}
function updateLocalPet(pet) {
  if (!pet || !pet.student_id) return;
  const cfg = petCfg();
  const index = cfg.pets.findIndex(p => String(p.student_id) === String(pet.student_id));
  if (index >= 0) cfg.pets[index] = { ...cfg.pets[index], ...pet };
  else cfg.pets.unshift(pet);
}
function petItemButtonClass(active) {
  return 'min-h-[38px] shrink-0 rounded-full px-4 text-xs font-black active-scale ' + (active ? 'bg-[#6B48FF] text-white' : 'bg-[#F8F8FC] text-[#74777c] border border-gray-100');
}
function petEnvButtonClass(active) {
  return 'inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-black active-scale ' + (active ? 'bg-[#2D2A4A] text-white' : 'bg-[#F8F8FC] text-[#74777c] border border-gray-100');
}
function petEnvDemoButtonClass(active) {
  return 'inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-black active-scale ' + (active ? 'bg-[#6B48FF] text-white' : 'bg-white text-[#6B48FF] border border-[#E3DEFF]');
}
function petEnvironmentBackground(id) {
  const backgrounds = {
    'warm-sun':'radial-gradient(circle at 18% 24%,rgba(255,255,255,.92) 0 8%,rgba(255,255,255,0) 22%),linear-gradient(145deg,#bfdbfe 0%,#fef3c7 52%,#bbf7d0 100%)',
    forest:'radial-gradient(circle at 16% 18%,rgba(255,255,255,.55) 0 9%,rgba(255,255,255,0) 24%),linear-gradient(145deg,#dcfce7 0%,#86efac 48%,#14532d 100%)',
    starry:'radial-gradient(circle at 22% 20%,rgba(255,255,255,.86) 0 2%,rgba(255,255,255,0) 7%),radial-gradient(circle at 72% 28%,rgba(255,255,255,.75) 0 1.5%,rgba(255,255,255,0) 6%),linear-gradient(145deg,#312e81 0%,#1e1b4b 52%,#020617 100%)',
    ocean:'radial-gradient(circle at 20% 18%,rgba(255,255,255,.85) 0 8%,rgba(255,255,255,0) 22%),linear-gradient(145deg,#bae6fd 0%,#38bdf8 50%,#0f766e 100%)',
    test:'radial-gradient(circle at 18% 24%,rgba(255,255,255,.9) 0 8%,rgba(255,255,255,0) 22%),linear-gradient(145deg,#bfdbfe 0%,#fef3c7 48%,#bbf7d0 100%)'
  };
  return backgrounds[id] || backgrounds['warm-sun'];
}
function petEnvironmentLayeredBackground(id) {
  return 'linear-gradient(180deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,.58) 58%,rgba(255,255,255,.94) 100%),' + petEnvironmentBackground(id);
}
function showPetEnvironmentDemo(source) {
  const panel = source?.closest('[data-student-pet-panel]') || document;
  panel.querySelectorAll('[data-pet-env-demo]').forEach(button => { button.className = petEnvDemoButtonClass(button === source); });
  const stage = panel.querySelector('[data-pet-env-stage]');
  if (stage) {
    stage.style.backgroundImage = petEnvironmentLayeredBackground(source?.dataset.petEnvDemo || 'test');
    stage.classList.add('ring-2','ring-[#6B48FF]/30');
    setTimeout(() => stage.classList.remove('ring-2','ring-[#6B48FF]/30'), 420);
  }
}
function updateStudentPetDom(pet) {
  const panel = document.querySelector('[data-student-pet-panel]');
  if (!panel || !pet) return;
  const info = petLevelInfo(pet);
  const type = petTypeMeta(pet.pet_type);
  const env = petEnvMeta(pet.environment_key);
  const asset = petAssetUrl(pet, info);
  panel.querySelectorAll('[data-pet-image]').forEach(img => {
    img.alt = pet.pet_name || 'pet';
    if (img.getAttribute('src') !== asset) {
      img.style.opacity = '0';
      img.onload = () => { img.style.opacity = ''; };
      img.src = asset;
    }
  });
  panel.querySelectorAll('[data-pet-kind-env]').forEach(node => { node.textContent = type.zh + ' · ' + env.label; });
  panel.querySelectorAll('[data-pet-env-stage]').forEach(node => { node.style.backgroundImage = petEnvironmentLayeredBackground(env.id); });
  panel.querySelectorAll('[data-pet-env-demo]').forEach(button => { button.className = petEnvDemoButtonClass(false); });
  panel.querySelectorAll('[data-pet-points-text]').forEach(node => { node.textContent = Number(pet.pet_points || 0) + ' 积分'; });
  panel.querySelectorAll('[data-pet-points-value]').forEach(node => { node.textContent = Number(pet.pet_points || 0); });
  panel.querySelectorAll('[data-pet-stage-text]').forEach(node => { node.textContent = 'Stage ' + info.stage; });
  panel.querySelectorAll('[data-pet-equip]').forEach(button => {
    const key = button.dataset.petEquip || '';
    button.className = petItemButtonClass((pet.equipped_item || '') === key);
  });
  panel.querySelectorAll('[data-pet-env]').forEach(button => {
    button.className = petEnvButtonClass(env.id === button.dataset.petEnv);
  });
}
function markPetItemOwned(itemKey) {
  const panel = document.querySelector('[data-student-pet-panel]');
  const button = Array.from(panel?.querySelectorAll('[data-pet-buy]') || []).find(node => node.dataset.petBuy === itemKey);
  if (!button) return;
  const item = petItems().find(i => i.item_key === itemKey);
  button.removeAttribute('data-pet-buy');
  button.dataset.petEquip = itemKey;
  button.textContent = item?.label || itemKey;
}
function hydrateStudentPetCollapse() {
  const u = currentUser();
  if (!u || u.role !== 'student') return;
  const pet = petForStudent(u.id);
  if (!pet || pet.is_visible === false) return;
  const panel = document.querySelector('[data-student-pet-panel]');
  if (!panel || panel.querySelector('[data-pet-collapse]')) return;
  const content = panel.firstElementChild;
  if (!content || !content.matches('section')) return;
  const info = petLevelInfo(pet);
  const type = petTypeMeta(pet.pet_type);
  const env = petEnvMeta(pet.environment_key);
  const asset = petAssetUrl(pet, info);
  const collapsedKey = 'xy_pet_collapsed:' + String(u.id);
  const details = document.createElement('details');
  details.dataset.petCollapse = '1';
  details.open = localStorage.getItem(collapsedKey) !== '1';
  details.className = 'pet-collapse group motion-panel-enter overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_50px_-24px_rgba(92,45,255,0.22)]';
  details.innerHTML = '<summary class="pet-collapse-summary relative flex min-h-[86px] cursor-pointer list-none items-center justify-between gap-4 bg-white px-4 py-3 md:px-5"><span class="pet-collapse-brief flex min-w-0 flex-1 items-center justify-between gap-4"><span class="flex min-w-0 items-center gap-3"><span class="pet-orbit-scene relative flex h-14 w-14 shrink-0 items-center justify-center" style="--pet-accent:' + type.accent + '">' + petParticleNodes('mini') + '<span class="pet-float"><img data-pet-image src="' + esc(asset) + '" alt="' + esc(pet.pet_name) + '" loading="lazy" onerror="this.style.display=&quot;none&quot;" class="p-1"><span class="pet-fallback-icon material-symbols-outlined text-[30px]" style="color:' + type.accent + '">' + type.icon + '</span></span></span><span class="min-w-0"><span class="block truncate text-lg font-black text-[#2c2f33]">' + esc(pet.pet_name) + '</span><span class="mt-1 flex flex-wrap items-center gap-2"><span class="rounded-full bg-[#F4F2FF] px-2.5 py-1 text-[10px] font-black text-[#6B48FF]">Lv.' + info.level + '</span><span data-pet-kind-env class="rounded-full bg-[#F8F8FC] px-2.5 py-1 text-[10px] font-black text-gray-500">' + type.zh + ' · ' + env.label + '</span></span></span></span><span class="flex shrink-0 items-center gap-3"><span class="hidden min-w-[8rem] sm:block"><span class="mb-1 flex justify-between text-[10px] font-black text-gray-400"><span>EXP</span><span>' + info.progress + '%</span></span><span class="block h-2 overflow-hidden rounded-full bg-[#F4F2FF]"><span class="block h-full rounded-full bg-[#6B48FF]" style="width:' + info.progress + '%"></span></span></span><span data-pet-points-text class="rounded-full bg-[#F8F8FC] px-3 py-1.5 text-xs font-black text-[#2D2A4A]">' + Number(pet.pet_points || 0) + ' 积分</span></span></span><span class="pet-collapse-open-title flex min-w-0 items-center gap-2 text-sm font-black text-[#6B48FF]"><span class="material-symbols-outlined text-[20px]">keyboard_arrow_up</span><span>收起宠物档案</span></span><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4F2FF] text-[#6B48FF]"><i class="pet-collapse-chevron fa-solid fa-chevron-down text-xs"></i></span></summary><div data-pet-collapse-body class="pet-collapse-body border-t border-gray-100"></div>';
  panel.replaceChild(details, content);
  const body = details.querySelector('[data-pet-collapse-body]');
  const summary = details.querySelector('summary');
  const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  body.appendChild(content);
  body.style.height = details.open ? 'auto' : '0px';
  summary.addEventListener('click', event => {
    event.preventDefault();
    if (details.dataset.animating === '1') return;
    const nextOpen = !details.open;
    localStorage.setItem(collapsedKey, nextOpen ? '0' : '1');
    if (reducedMotion()) {
      details.open = nextOpen;
      body.style.height = nextOpen ? 'auto' : '0px';
      return;
    }
    details.dataset.animating = '1';
    if (nextOpen) {
      details.open = true;
      body.style.height = '0px';
      body.style.opacity = '0';
      requestAnimationFrame(() => {
        body.style.height = body.scrollHeight + 'px';
        body.style.opacity = '1';
      });
      const onOpenEnd = event => {
        if (event.target !== body || event.propertyName !== 'height') return;
        body.style.height = 'auto';
        body.style.opacity = '';
        details.dataset.animating = '0';
        body.removeEventListener('transitionend', onOpenEnd);
      };
      body.addEventListener('transitionend', onOpenEnd);
    } else {
      body.style.height = body.scrollHeight + 'px';
      body.style.opacity = '1';
      body.offsetHeight;
      requestAnimationFrame(() => {
        body.style.height = '0px';
        body.style.opacity = '0';
      });
      const onCloseEnd = event => {
        if (event.target !== body || event.propertyName !== 'height') return;
        details.open = false;
        body.style.opacity = '';
        details.dataset.animating = '0';
        body.removeEventListener('transitionend', onCloseEnd);
      };
      body.addEventListener('transitionend', onCloseEnd);
    }
  });
}
function refreshStudentPetPanel() {
  const panel = document.querySelector('[data-student-pet-panel]');
  if (panel) {
    panel.innerHTML = studentPetPanel();
    hydrateStudentPetCollapse();
  }
}
async function buyPetItem(itemKey) {
  const u = currentUser();
  if (!u || u.role !== 'student') return;
  const result = await sb.rpc('purchase_pet_item', { p_student_id:String(u.id), p_item_key:itemKey });
  if (result.error) return showAlert(petErrorMessage(result.error), '购买失败');
  const pet = result.data && (result.data.pet || result.data);
  updateLocalPet(pet);
  if (!petCfg().inventory.some(i => String(i.student_id) === String(u.id) && i.item_key === itemKey)) petCfg().inventory.unshift({ student_id:String(u.id), item_key:itemKey, acquired_at:new Date().toISOString() });
  markPetItemOwned(itemKey);
  if (pet) {
    await preloadPetAsset(pet);
    updateStudentPetDom(pet);
  } else {
    refreshStudentPetPanel();
  }
}
async function equipPetItem(itemKey) {
  const u = currentUser();
  if (!u || u.role !== 'student') return;
  const current = petForStudent(u.id);
  const target = current ? { ...current, equipped_item:itemKey || null } : null;
  const preload = preloadPetAsset(target);
  const result = await sb.rpc('equip_pet_item', { p_student_id:String(u.id), p_item_key:itemKey || null });
  if (result.error) return showAlert(petErrorMessage(result.error), '装扮失败');
  const pet = result.data || target;
  await preload;
  await preloadPetAsset(pet);
  updateLocalPet(pet);
  updateStudentPetDom(pet);
}
async function setPetEnvironment(environmentKey) {
  const u = currentUser();
  if (!u || u.role !== 'student') return;
  const result = await sb.rpc('set_pet_environment', { p_student_id:String(u.id), p_environment_key:environmentKey });
  if (result.error) return showAlert(petErrorMessage(result.error), '切换失败');
  const current = petForStudent(u.id);
  const pet = result.data || (current ? { ...current, environment_key:environmentKey } : null);
  updateLocalPet(pet);
  updateStudentPetDom(pet);
}
async function savePetItemRule(itemKey) {
  const item = petItems().find(i => i.item_key === itemKey);
  if (!item) return;
  const payload = { item_key:itemKey, label:item.label, price:Math.max(0, Number(document.getElementById('pet-item-price-' + itemKey)?.value || 0)), sort_order:item.sort_order || 0, active:document.getElementById('pet-item-active-' + itemKey)?.value !== 'false' };
  const result = await sb.from('pet_item_rules').upsert(payload);
  if (result.error) return showAlert(petErrorMessage(result.error), '保存失败');
  await loadPetData(false);
  toast('装扮规则已保存。');
}
async function savePetLevelRule(level) {
  const payload = { level:Number(level), required_xp:Math.max(0, Number(document.getElementById('pet-level-xp-' + level)?.value || 0)), stage:Math.max(1, Math.min(4, Number(document.getElementById('pet-level-stage-' + level)?.value || level))) };
  const result = await sb.from('pet_level_rules').upsert(payload);
  if (result.error) return showAlert(petErrorMessage(result.error), '保存失败');
  await loadPetData(false);
  toast('等级规则已保存。');
}
async function savePetRewardRule(key) {
  const rule = petRewards().find(r => r.tier_key === key);
  if (!rule) return;
  const payload = { tier_key:key, label:rule.label, min_score:Math.max(0, Math.min(100, Number(document.getElementById('pet-reward-min-' + key)?.value || 0))), xp_reward:Math.max(0, Number(document.getElementById('pet-reward-xp-' + key)?.value || 0)), point_reward:Math.max(0, Number(document.getElementById('pet-reward-points-' + key)?.value || 0)), sort_order:rule.sort_order || 0, active:rule.active !== false };
  const result = await sb.from('pet_reward_rules').upsert(payload);
  if (result.error) return showAlert(petErrorMessage(result.error), '保存失败');
  await loadPetData(false);
  toast('奖励规则已保存。');
}
function showConfirm(msg, title, okText, okClass, onConfirm) {
  window.__xy_confirm_action = async () => {
    window.__xy_confirm_action = null;
    closeModal();
    await onConfirm();
  };
  modalRoot.innerHTML = '<div class="fixed inset-0 z-[9999] flex items-center justify-center p-4"><div class="absolute inset-0 bg-black/40 backdrop-blur-sm" data-close-modal></div><div class="bg-white rounded-[32px] p-8 w-full max-w-sm relative z-10 shadow-2xl text-center motion-auth-panel-enter"><h3 class="text-[20px] font-black text-[#2D2A4A] mb-3">' + esc(title || '确认操作') + '</h3><p class="text-[15px] text-gray-500 mb-8 font-medium whitespace-pre-wrap leading-relaxed">' + esc(msg) + '</p><div class="flex gap-4"><button data-close-modal class="flex-1 bg-gray-100 text-gray-600 font-bold rounded-2xl py-4 active-scale">取消</button><button data-confirm-action class="flex-1 text-white font-bold rounded-2xl py-4 shadow-lg active-scale ' + esc(okClass || 'bg-[#6B48FF] shadow-[#6B48FF]/30') + '">' + esc(okText || '确认') + '</button></div></div></div>';
}
function showAlert(msg, title = '提示') { modalRoot.innerHTML = '<div class="fixed inset-0 z-[9999] flex items-center justify-center p-4"><div class="absolute inset-0 bg-black/40 backdrop-blur-sm" data-close-modal></div><div class="bg-white rounded-[32px] p-8 w-full max-w-sm relative z-10 shadow-2xl text-center motion-auth-panel-enter"><h3 class="text-[20px] font-black text-[#2D2A4A] mb-3">' + esc(title) + '</h3><p class="text-[15px] text-gray-500 mb-8 font-medium whitespace-pre-wrap leading-relaxed">' + esc(msg) + '</p><button data-close-modal class="w-full bg-[#6B48FF] text-white font-bold rounded-2xl py-4 text-base shadow-lg shadow-[#6B48FF]/30 active-scale">我知道了</button></div></div>'; }
function openLesson(id, file) { const access = lessonAccess(id); if (!access.allowed) { if (access.reason === 'login') return showLogin(); return toast(access.reason === 'class' ? '这个单元还没有开放给你' : '没有识别到这个单元的权限信息'); } location.href = lessonHref(file, id); }
function switchTeacherTab(tabEl) {
  const next = tabEl.dataset.teacherTab;
  const scroller = tabEl.closest('[data-teacher-tabs]');
  const oldScrollLeft = scroller ? scroller.scrollLeft : 0;
  state.teacherTab = next;
  render();
  requestAnimationFrame(() => {
    const nextScroller = document.querySelector('[data-teacher-tabs]');
    if (nextScroller) nextScroller.scrollLeft = oldScrollLeft;
    requestAnimationFrame(() => {
      document.querySelector('[data-teacher-tab="' + next + '"]')?.scrollIntoView({ behavior:'smooth', inline:'center', block:'nearest' });
    });
  });
}
function toast(message) { const node = document.createElement('div'); node.className = 'fixed left-1/2 top-8 z-[100] max-w-sm -translate-x-1/2 rounded-full bg-[#2c2f33] px-5 py-3 text-center text-sm font-black text-white shadow-2xl'; node.textContent = message; document.body.appendChild(node); setTimeout(() => node.remove(),2600); }
document.addEventListener('click', e => {
  const tab = e.target.closest('[data-teacher-tab]');
  if (!tab) return;
  e.stopImmediatePropagation();
  if (!suppressCarouselClick) playClick();
  switchTeacherTab(tab);
}, true);
document.addEventListener('click', e => { if (e.target.closest('button,a,[data-route],[data-toast],[data-home-tab],[data-slide-index],[data-carousel-slide],[data-login],[data-logout],[data-open-lesson],[data-teacher-tab]') && !suppressCarouselClick) playClick(); const route = e.target.closest('[data-route]'); if (route) return routeTo(route.dataset.route, route.dataset.level || null, true); const t = e.target.closest('[data-toast]'); if (t) return toast(t.dataset.toast); const homeTab = e.target.closest('[data-home-tab]'); if (homeTab) { state.homeTab = homeTab.dataset.homeTab; return render(); } const dot = e.target.closest('[data-slide-index]'); if (dot) return updateCarousel(Number(dot.dataset.slideIndex) || 0); const slide = e.target.closest('[data-carousel-slide]'); if (slide) return openCarouselSlide(Number(slide.dataset.carouselSlide) || 0); if (e.target.closest('[data-login]')) return showLogin(); if (e.target.closest('[data-logout]')) return logout(); const open = e.target.closest('[data-open-lesson]'); if (open) return openLesson(open.dataset.moduleId, open.dataset.file); const tab = e.target.closest('[data-teacher-tab]'); if (tab) { state.teacherTab = tab.dataset.teacherTab; render(); setTimeout(() => document.querySelector('[data-teacher-tab="' + state.teacherTab + '"]')?.scrollIntoView({ behavior:'smooth', inline:'center', block:'nearest' }), 40); return; } const chip = e.target.closest('[data-toggle-chip]'); if (chip) { chip.classList.toggle('selected'); return; } if (e.target.closest('[data-regen-pwd]')) return regenPwd(); if (e.target.closest('[data-save-student]') || e.target.closest('[data-add-student]')) return addStudent(); const studentInfo = e.target.closest('[data-student-info]'); if (studentInfo) return showStudentInfo(studentInfo.dataset.studentInfo); const delStudent = e.target.closest('[data-delete-student]'); if (delStudent) return deleteStudent(delStudent.dataset.deleteStudent); const pub = e.target.closest('[data-publish-lesson]'); if (pub) return syncLesson(pub.dataset.publishLesson, 'open'); if (e.target.closest('[data-add-homework]')) return addHomework(); if (e.target.closest('[data-migrate-lessons]')) return migrateRegistryLessonsToStorage(); const editHw = e.target.closest('[data-edit-homework]'); if (editHw) return showHomeworkEditor(editHw.dataset.editHomework); if (e.target.closest('[data-save-homework-edit]')) return saveHomeworkEdit(); if (e.target.closest('[data-close-old-hw]')) return closeAllOldHw(); const delHw = e.target.closest('[data-delete-homework]'); if (delHw) return deleteHomework(delHw.dataset.deleteHomework); if (e.target.closest('[data-generate-attendance]')) return generateAttendance(); const exempt = e.target.closest('[data-open-exempt]'); if (exempt) return openExemptModal(exempt.dataset.openExempt, exempt.dataset.studentName); const applyExemptBtn = e.target.closest('[data-apply-exempt]'); if (applyExemptBtn) return applyExempt(applyExemptBtn.dataset.applyExempt, applyExemptBtn.dataset.studentName); if (e.target.closest('[data-report-refresh]')) return loadReportData(true); const compare = e.target.closest('[data-report-compare]'); if (compare) return toggleReportCompare(compare.dataset.reportCompare); if (e.target.closest('[data-confirm-action]') && window.__xy_confirm_action) return window.__xy_confirm_action(); const previewBanner = e.target.closest('[data-preview-banner]'); if (previewBanner) return showBannerPreview(previewBanner.dataset.previewBanner); const editBanner = e.target.closest('[data-edit-banner]'); if (editBanner) return showBannerEditor(editBanner.dataset.editBanner); if (e.target.closest('[data-save-banner-edit]')) return saveBannerEdit(); if (e.target.closest('[data-add-banner]')) return addBanner(); const bannerPageStep = e.target.closest('[data-banner-page-step]'); if (bannerPageStep) return shiftBannerPage(bannerPageStep.dataset.bannerPageStep, Number(bannerPageStep.dataset.bannerPageDelta)); const delBanner = e.target.closest('[data-delete-banner]'); if (delBanner) return deleteBanner(delBanner.dataset.deleteBanner); if (e.target.closest('[data-do-login]')) return doLogin(); if (e.target.closest('[data-close-modal]')) return closeModal(); });
document.addEventListener('touchstart', e => { const carousel = e.target.closest('[data-carousel]'); if (!carousel) return; const touch = e.touches && e.touches[0]; if (!touch) return; if (carouselSuppressTimer) clearTimeout(carouselSuppressTimer); suppressCarouselClick = false; carouselStartX = touch.clientX; carouselStartY = touch.clientY; }, { passive:true });
document.addEventListener('touchend', e => { const carousel = e.target.closest('[data-carousel]'); if (!carousel) return; const touch = e.changedTouches && e.changedTouches[0]; if (!touch) return; const dx = touch.clientX - carouselStartX; const dy = touch.clientY - carouselStartY; const ax = Math.abs(dx); const ay = Math.abs(dy); if (ax < 56 || ax <= ay + 12) { suppressCarouselClick = false; return; } suppressCarouselClick = true; if (carouselSuppressTimer) clearTimeout(carouselSuppressTimer); carouselSuppressTimer = setTimeout(() => { suppressCarouselClick = false; carouselSuppressTimer = null; }, 260); updateCarousel(state.slide + (dx < 0 ? 1 : -1)); }, { passive:true });
document.addEventListener('change', e => { const reportField = e.target.closest('[data-report-field]'); if (reportField) return updateReportField(reportField.dataset.reportField, reportField.value); const bannerToggle = e.target.closest('[data-toggle-banner]'); if (bannerToggle) return updateBannerStatus(bannerToggle.dataset.toggleBanner, bannerToggle.checked, bannerToggle); const toggle = e.target.closest('[data-toggle-lesson]'); if (toggle) syncLesson(toggle.dataset.toggleLesson, toggle.checked ? 'open' : 'closed', toggle); });
document.addEventListener('click', e => { if (e.target.closest('[data-open-att-picker]')) return showAttendancePicker(); if (e.target.closest('[data-close-att-picker]')) return closeAttendancePicker(); const pickerToggle = e.target.closest('[data-att-picker-toggle]'); if (pickerToggle) return toggleAttendancePickerStudent(pickerToggle.dataset.attPickerToggle); if (e.target.closest('[data-att-picker-all]')) return pickerSelectAllAttendanceStudents(); if (e.target.closest('[data-att-picker-clear]')) return pickerClearAttendanceStudents(); if (e.target.closest('[data-att-select-all]')) return selectAllAttendanceStudents(); if (e.target.closest('[data-att-clear]')) return clearAttendanceStudents(); if (e.target.closest('[data-save-attendance]')) return saveAttendance(); if (e.target.closest('[data-refresh-attendance]')) return loadAttendanceRecords(true); const del = e.target.closest('[data-delete-attendance]'); if (del) return deleteAttendance(del.dataset.deleteAttendance); });
document.addEventListener('change', e => { const field = e.target.closest('[data-att-field]'); if (field) return updateAttendanceField(field.dataset.attField, field.value); const student = e.target.closest('[data-att-student]'); if (student) return toggleAttendanceStudent(student.dataset.attStudent, student.checked); });
document.addEventListener('input', e => { const field = e.target.closest('[data-att-field="note"]'); if (field) attendanceCfg().note = field.value; });
document.addEventListener('click', e => { if (e.target.closest('[data-vote-refresh]')) return loadVoteTopics(true); if (e.target.closest('[data-vote-refresh-results]')) return loadVoteResults(true); const pick = e.target.closest('[data-vote-select]'); if (pick) { voteCfg().selectedTopicNumber = Number(pick.dataset.voteSelect); voteCfg().error = ''; voteCfg().success = null; return render(); } if (e.target.closest('[data-vote-back]')) { voteCfg().selectedTopicNumber = null; voteCfg().error = ''; return render(); } if (e.target.closest('[data-vote-clear-success]')) { voteCfg().success = null; return render(); } if (e.target.closest('[data-vote-export]')) return exportVoteCsv(); const delVote = e.target.closest('[data-delete-vote]'); if (delVote) return deleteVoteSubmission(delVote.dataset.deleteVote); });
document.addEventListener('submit', e => { const form = e.target.closest('#vote-form'); if (!form) return; e.preventDefault(); submitVoteForm(form); });
document.addEventListener('change', e => { const filter = e.target.closest('[data-vote-class-filter]'); if (filter) { voteCfg().classFilter = filter.value; render(); } });
document.addEventListener('click', e => {
  if (e.target.closest('[data-pet-refresh]')) return loadPetData(true);
  const init = e.target.closest('[data-init-pet]');
  if (init) return createPetForStudent(currentUser()?.id, init.dataset.initPet, document.getElementById('pet-name')?.value || '');
  const buy = e.target.closest('[data-pet-buy]');
  if (buy) return buyPetItem(buy.dataset.petBuy);
  const equip = e.target.closest('[data-pet-equip]');
  if (equip) return equipPetItem(equip.dataset.petEquip || '');
  const demoEnv = e.target.closest('[data-pet-env-demo]');
  if (demoEnv) return showPetEnvironmentDemo(demoEnv);
  const env = e.target.closest('[data-pet-env]');
  if (env) return setPetEnvironment(env.dataset.petEnv);
  const student = e.target.closest('[data-pet-student]');
  if (student) { petCfg().activeStudentId = student.dataset.petStudent; return render(); }
  const create = e.target.closest('[data-admin-create-pet]');
  if (create) { const root = create.closest('[data-pet-student-panel]') || document; return createPetForStudent(create.dataset.adminCreatePet, root.querySelector('[data-pet-create-type]')?.value || document.getElementById('pet-admin-create-type')?.value || 'fox', root.querySelector('[data-pet-create-name]')?.value || document.getElementById('pet-admin-create-name')?.value || ''); }
  const save = e.target.closest('[data-admin-save-pet]');
  if (save) return saveStudentPet(save.dataset.adminSavePet, save);
  const adjust = e.target.closest('[data-admin-adjust-pet]');
  if (adjust) return adjustStudentPet(adjust.dataset.adminAdjustPet, adjust);
  const item = e.target.closest('[data-save-pet-item]');
  if (item) return savePetItemRule(item.dataset.savePetItem);
  const level = e.target.closest('[data-save-pet-level]');
  if (level) return savePetLevelRule(level.dataset.savePetLevel);
  const reward = e.target.closest('[data-save-pet-reward]');
  if (reward) return savePetRewardRule(reward.dataset.savePetReward);
});
document.addEventListener('input', e => {
  const search = e.target.closest('[data-pet-search]');
  if (search) {
    petCfg().search = search.value;
    if (petSearchTimer) clearTimeout(petSearchTimer);
    petSearchTimer = setTimeout(() => { petSearchTimer = null; render(); }, 180);
  }
});
const query = new URLSearchParams(location.search); if (query.get('tab')) state.teacherTab = query.get('tab'); routeTo(query.get('page') || 'home', query.get('level'), false); loadData();
