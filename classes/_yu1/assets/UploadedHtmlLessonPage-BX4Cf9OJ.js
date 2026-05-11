import{i as e,n as t,t as n}from"./jsx-runtime-BnxRlLMJ.js";import{r}from"./contentRegistry-Fd4725UQ.js";import{i}from"./api-YDBZkcWX.js";import{i as a,l as o,u as s}from"./index-B2mj-d9J.js";var c=e(t(),1);function l(e,t){return t||(t=e.slice(0)),Object.freeze(Object.defineProperties(e,{raw:{value:Object.freeze(t)}}))}var u=n(),d,f=[`allow-scripts`,`allow-forms`,`allow-modals`,`allow-popups`,`allow-popups-to-escape-sandbox`,`allow-downloads`,`allow-presentation`].join(` `),p=`<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta http-equiv="Content-Security-Policy" content="${[`default-src 'self' data: blob: https: http:`,`img-src * data: blob:`,`media-src * data: blob:`,`style-src 'unsafe-inline' https: http:`,`script-src 'unsafe-inline' 'unsafe-eval' data: blob: https: http:`,`font-src * data: blob:`,`connect-src https: http: ws: wss:`,`frame-src * data: blob:`,`worker-src data: blob: https: http:`,`form-action *`].join(`; `)}" /><base target="_blank" />${String.raw(d||(d=l([`
<script>
(() => {
  const createMemoryStorage = () => {
    const values = Object.create(null);
    return {
      get length() { return Object.keys(values).length; },
      key(index) { return Object.keys(values)[index] || null; },
      getItem(key) { key = String(key); return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null; },
      setItem(key, value) { values[String(key)] = String(value); },
      removeItem(key) { delete values[String(key)]; },
      clear() { Object.keys(values).forEach((key) => delete values[key]); }
    };
  };

  const ensureStorage = (name) => {
    try {
      const storage = window[name];
      const key = '__uploaded_html_storage_test__';
      storage.setItem(key, key);
      storage.removeItem(key);
    } catch {
      try {
        Object.defineProperty(window, name, {
          configurable: true,
          value: createMemoryStorage()
        });
      } catch {}
    }
  };

  ensureStorage('localStorage');
  ensureStorage('sessionStorage');
})();
<\/script>`])))}`,m=e=>{let t=e.trim();return/<html[\s>]/i.test(t)?/<head[\s>]/i.test(t)?t.replace(/<head([^>]*)>/i,`<head$1>${p}`):t.replace(/<html([^>]*)>/i,`<html$1><head>${p}</head>`):`<!doctype html><html><head>${p}</head><body>${t}</body></html>`},h=({title:e,icon:t,levelTitle:n,onBack:r})=>(0,u.jsxs)(`div`,{className:`min-h-screen flex flex-col items-center pb-20 bg-slate-50 font-sans`,children:[(0,u.jsx)(`header`,{className:`sticky top-0 z-30 w-full border-b border-slate-200 bg-white px-6 py-4 shadow-sm md:py-6`,children:(0,u.jsxs)(`div`,{className:`mx-auto flex w-full max-w-5xl items-center`,children:[(0,u.jsxs)(`button`,{onClick:r,className:`group relative mr-6 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 transition-all duration-300 hover:bg-blue-100`,"aria-label":`Back to Level`,children:[(0,u.jsx)(`div`,{className:`absolute inset-1 rounded-full bg-white shadow-sm transition-all duration-300 group-active:scale-90 group-hover:bg-blue-600`}),(0,u.jsx)(`i`,{className:`fa-solid fa-arrow-left relative z-10 text-xl text-slate-600 transition-colors duration-300 group-hover:-translate-x-0.5 group-hover:text-white`})]}),(0,u.jsxs)(`div`,{className:`flex flex-col`,children:[(0,u.jsx)(`p`,{className:`text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 md:text-xs`,children:`Level Toolset`}),(0,u.jsx)(`h1`,{className:`mt-1 text-lg font-black leading-none tracking-tight text-slate-900 md:text-2xl`,children:n})]})]})}),(0,u.jsx)(`main`,{className:`mt-10 w-full max-w-5xl px-4 md:px-8`,children:(0,u.jsxs)(`div`,{className:`fade-in rounded-[2rem] border border-slate-200 bg-white px-6 py-24 text-center shadow-sm`,children:[(0,u.jsx)(`div`,{className:`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50`,children:(0,u.jsx)(`i`,{className:`fa-solid ${t} text-3xl text-slate-300`})}),(0,u.jsx)(`h3`,{className:`text-xl font-black text-slate-800`,children:e})]})})]}),g=()=>{let{levelId:e,moduleSlug:t}=s(),n=o(),{profile:l}=a(),[d,p]=(0,c.useState)(void 0),g=(0,c.useMemo)(()=>r(e),[e])?.title??`教学单元`,_=(0,c.useMemo)(()=>d?.html_content?m(d.html_content):``,[d]),v=(0,c.useMemo)(()=>{if(!_)return``;try{let e=new Blob([_],{type:`text/html`});return URL.createObjectURL(e)}catch{return``}},[_]);return(0,c.useEffect)(()=>{if(v)return()=>{URL.revokeObjectURL(v)}},[v]),(0,c.useEffect)(()=>{let n=!1;return(async()=>{try{let r=await i({levelId:e,slug:t});n||p(r)}catch{n||p(null)}})(),()=>{n=!0}},[e,t]),d===void 0?(0,u.jsx)(`div`,{className:`flex min-h-dvh items-center justify-center text-sm font-black uppercase tracking-[0.3em] text-slate-400`,children:`Loading`}):d?l?.role!==`teacher`&&!d.visible?(0,u.jsx)(h,{title:`暂未开放`,icon:`fa-ban`,levelTitle:g,onBack:()=>n(`/level/${e}`)}):(0,u.jsxs)(`div`,{className:`flex min-h-dvh flex-col bg-slate-100`,children:[(0,u.jsx)(`header`,{className:`sticky top-0 z-30 w-full border-b border-slate-200 bg-white px-6 py-4 shadow-sm`,children:(0,u.jsxs)(`div`,{className:`mx-auto flex w-full max-w-6xl items-center justify-between gap-4`,children:[(0,u.jsxs)(`div`,{className:`flex min-w-0 items-center gap-4`,children:[(0,u.jsxs)(`button`,{type:`button`,onClick:()=>n(`/level/${e}`),className:`group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 transition hover:bg-blue-100`,"aria-label":`返回单元列表`,children:[(0,u.jsx)(`div`,{className:`absolute inset-1 rounded-full bg-white shadow-sm transition group-hover:bg-blue-600`}),(0,u.jsx)(`i`,{className:`fa-solid fa-arrow-left relative z-10 text-sm text-slate-600 transition group-hover:text-white`})]}),(0,u.jsxs)(`div`,{className:`min-w-0`,children:[(0,u.jsx)(`p`,{className:`text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400`,children:g}),(0,u.jsx)(`h1`,{className:`truncate text-xl font-black tracking-tight text-slate-900`,children:d.unit_name})]})]}),(0,u.jsx)(`span`,{className:`hidden rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500 md:block`,children:`HTML Lesson`})]})}),(0,u.jsx)(`main`,{className:`flex-1 p-3 md:p-6`,children:(0,u.jsx)(`div`,{className:`uploaded-html-viewport mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm`,children:(0,u.jsx)(`iframe`,{title:d.unit_name,src:v||void 0,srcDoc:v?void 0:_,className:`h-full w-full border-0`,sandbox:f,allow:`autoplay; clipboard-read; clipboard-write; fullscreen; microphone; camera`,allowFullScreen:!0,referrerPolicy:`strict-origin-when-cross-origin`},v||`srcdoc`)})})]}):(0,u.jsx)(h,{title:`内容开发中`,icon:`fa-person-digging`,levelTitle:g,onBack:()=>n(`/level/${e}`)})};export{g as default};