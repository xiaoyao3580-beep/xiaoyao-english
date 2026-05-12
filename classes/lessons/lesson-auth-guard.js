(function () {
  const CLASS_ALIAS = { ms: 'junior-ability', econ: 'economist', adult: 'others' };
  const registryUrl = new URL('../../content-data.js?v=20260512-auth-guard', location.href).href;

  function readUser() {
    try { return JSON.parse(localStorage.getItem('xy_user') || 'null'); } catch { return null; }
  }
  function normalizeClass(value) {
    const text = String(value || '').replace(/_/g, '-');
    return CLASS_ALIAS[text] || text;
  }
  function userClasses(user) {
    return Array.isArray(user?.classes) ? user.classes.map(normalizeClass) : [];
  }
  function htmlEscape(value) {
    return String(value || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }
  function moduleIdFromPath() {
    const name = decodeURIComponent(location.pathname.split('/').pop() || '').replace(/\.html?$/i, '');
    return name === 'player' ? '' : name;
  }
  function currentModuleId() {
    const params = new URLSearchParams(location.search);
    return params.get('hwId') || document.body?.dataset?.moduleId || moduleIdFromPath();
  }
  function currentClassCode() {
    const params = new URLSearchParams(location.search);
    return normalizeClass(params.get('class') || document.body?.dataset?.classCode || '');
  }
  function loadRegistry() {
    if (window.XY_CONTENT_MODULES) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = registryUrl;
      script.onload = resolve;
      script.onerror = () => reject(new Error('课程权限数据加载失败'));
      document.head.appendChild(script);
    });
  }
  function levelForModule(moduleId) {
    const explicit = currentClassCode();
    if (explicit) return explicit;
    const modules = window.XY_CONTENT_MODULES || {};
    for (const [levelId, items] of Object.entries(modules)) {
      if ((items || []).some(item => String(item.id) === String(moduleId))) return normalizeClass(levelId);
    }
    return '';
  }
  function showGate(title, message, loginText) {
    window.__XY_LESSON_AUTH_DENIED__ = true;
    document.body.innerHTML =
      '<main style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#f5f6fc;color:#2D2A4A;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Microsoft YaHei,Arial,sans-serif">' +
      '<section style="width:min(420px,100%);border-radius:28px;background:white;padding:30px 26px;text-align:center;box-shadow:0 22px 64px -32px rgba(88,39,252,.45)">' +
      '<div style="width:72px;height:72px;margin:0 auto 18px;border-radius:999px;background:#F4F2FF;color:#6B48FF;display:flex;align-items:center;justify-content:center;font-size:34px">🔒</div>' +
      '<h1 style="margin:0;font-size:24px;font-weight:900;letter-spacing:-.03em">' + htmlEscape(title) + '</h1>' +
      '<p style="margin:12px auto 0;max-width:320px;color:#74777c;font-size:14px;line-height:1.8;font-weight:700">' + htmlEscape(message) + '</p>' +
      '<a href="../../index.html" style="display:inline-flex;align-items:center;justify-content:center;min-height:46px;margin-top:22px;border-radius:999px;background:#6B48FF;padding:0 22px;color:white;text-decoration:none;font-size:14px;font-weight:900;box-shadow:0 12px 28px -14px rgba(88,39,252,.65)">' + htmlEscape(loginText || '返回登录') + '</a>' +
      '</section></main>';
  }
  function activateGuardedContent() {
    document.querySelectorAll('iframe[data-src]').forEach(iframe => {
      if (!iframe.getAttribute('src')) iframe.setAttribute('src', iframe.dataset.src || '');
    });
  }
  function checkAccess() {
    return loadRegistry().then(() => {
      const user = readUser();
      const moduleId = currentModuleId();
      const levelId = levelForModule(moduleId);
      if (!user) return { allowed:false, reason:'login', moduleId, levelId };
      if (user.role === 'teacher') return { allowed:true, moduleId, levelId };
      if (!moduleId || !levelId) return { allowed:false, reason:'unknown', moduleId, levelId };
      const allowed = user.role === 'student' && userClasses(user).includes(levelId);
      return { allowed, reason:allowed ? '' : 'class', moduleId, levelId };
    }).catch(error => ({ allowed:false, reason:'error', error:error?.message || String(error) }));
  }

  window.xyLessonAuthReady = checkAccess().then(result => {
    if (result.allowed) {
      window.__XY_LESSON_AUTH_ALLOWED__ = true;
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', activateGuardedContent, { once:true });
      else activateGuardedContent();
      return result;
    }
    const copy = result.reason === 'login'
      ? ['请先登录', '登录学生账号后才能打开对应班级的作业。', '返回登录']
      : result.reason === 'class'
        ? ['暂无权限', '当前账号没有这个班级或单元的访问权限，请联系老师开通。', '返回首页']
        : ['无法打开课程', result.error || '没有识别到这个单元的权限信息，请从系统内重新进入。', '返回首页'];
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => showGate(copy[0], copy[1], copy[2]), { once:true });
    } else {
      showGate(copy[0], copy[1], copy[2]);
    }
    return result;
  });
})();
