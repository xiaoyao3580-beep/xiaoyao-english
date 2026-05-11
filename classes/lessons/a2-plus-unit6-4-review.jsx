const { useEffect, useRef, useState } = React;
const useLegacyLessonProgress = () => {};

const MODULE_ID = 'a2-plus-unit6-4-review';

const LEGACY_PAGE_STYLES = `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&family=Merriweather:ital,wght@0,300;0,700;1,300&family=ZCOOL+KuaiLe&display=swap');
.legacy-react-a2plus-unit64 {
      --app-height: 100vh;
      --header-height: 100px;
      --safe-area-bottom: env(safe-area-inset-bottom, 0px);
    }

    @supports (height: 100dvh) { .legacy-react-a2plus-unit64 { --app-height: 100dvh; } }
.legacy-react-a2plus-unit64 {
      margin: 0; padding: 0; width: 100%;
      height: var(--app-height); min-height: var(--app-height);
      background-color: #f1f5f9; /* 更柔和的外层灰度 */
      font-family: 'Nunito', -apple-system, sans-serif;
      -webkit-tap-highlight-color: transparent;
      overflow: hidden; 
    }
.legacy-react-a2plus-unit64 { min-height: -webkit-fill-available; }
.legacy-react-a2plus-unit64.app-root { width: 100%; height: 100%; min-height: var(--app-height); }

    /* Soft mesh background */
.legacy-react-a2plus-unit64 .bg-mesh {
      background-color: #f0f9ff;
      background-image: 
        radial-gradient(at 40% 20%, hsla(213,100%,94%,1) 0px, transparent 50%),
        radial-gradient(at 80% 0%, hsla(189,100%,91%,1) 0px, transparent 50%),
        radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%),
        radial-gradient(at 80% 50%, hsla(340,100%,95%,1) 0px, transparent 50%),
        radial-gradient(at 0% 100%, hsla(22,100%,92%,1) 0px, transparent 50%),
        radial-gradient(at 80% 100%, hsla(242,100%,95%,1) 0px, transparent 50%),
        radial-gradient(at 0% 0%, hsla(343,100%,96%,1) 0px, transparent 50%);
    }
.legacy-react-a2plus-unit64 .font-cute { font-family: 'ZCOOL KuaiLe', cursive; }
.legacy-react-a2plus-unit64 .font-serif-novel { font-family: 'Merriweather', serif; }
.legacy-react-a2plus-unit64 .pb-safe-bar { padding-bottom: calc(2rem + var(--safe-area-bottom)); } /* bottom safe area */
.legacy-react-a2plus-unit64 .no-scrollbar::-webkit-scrollbar { display: none; }
.legacy-react-a2plus-unit64 .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.legacy-react-a2plus-unit64 .mobile-scroll { -webkit-overflow-scrolling: touch; overscroll-behavior-y: contain; touch-action: pan-y; }

    @media (max-width: 767px) {
.legacy-react-a2plus-unit64 .app-shell { height: var(--app-height); min-height: var(--app-height); border-radius: 0; box-shadow: none; border: none; }
    }
    @media (min-width: 768px) {
      .legacy-react-a2plus-unit64.app-root { display: flex; align-items: center; justify-content: center; }
    }

    /* Animations */
.legacy-react-a2plus-unit64 .fade-in { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.legacy-react-a2plus-unit64 .menu-slide-down { animation: menuSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform-origin: top right; }
    @keyframes menuSlideDown { 0% { opacity: 0; transform: scale(0.9) translateY(-10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
.legacy-react-a2plus-unit64 .active-scale:active { transform: scale(0.95); transition: transform 0.1s; }

    /* Heartbeat menu animation */
    @keyframes heartbeat {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.4); }
      15% { transform: scale(1.15); box-shadow: 0 0 0 10px rgba(56, 189, 248, 0); }
      30% { transform: scale(1); }
      45% { transform: scale(1.15); box-shadow: 0 0 0 10px rgba(56, 189, 248, 0); }
      60% { transform: scale(1); }
      100% { transform: scale(1); }
    }
.legacy-react-a2plus-unit64 .animate-heartbeat { animation: heartbeat 2.5s infinite ease-in-out; }

    /* Writing input */
.legacy-react-a2plus-unit64 .writing-textarea {
      border: 2px solid #e2e8f0;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(8px);
      transition: all 0.3s ease;
      line-height: 1.8;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
    }
.legacy-react-a2plus-unit64 .writing-textarea:focus {
      border-color: #7dd3fc;
      background: #ffffff;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02), 0 0 0 4px rgba(125, 211, 252, 0.15);
      outline: none;
    }
    
    /* Text selection */
    .legacy-react-a2plus-unit64 ::selection { background: #bae6fd; color: #0369a1; }`;

const getPageRoot = () => document.querySelector('.legacy-react-a2plus-unit64');

const syncViewportHeight = () => {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const viewport = window.visualViewport;
  const nextHeight = Math.round(viewport ? viewport.height : window.innerHeight);
  getPageRoot()?.style.setProperty('--app-height', `${nextHeight}px`);
};

// --- 音效引擎 (仅保留极简按键音) ---
const playTone = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'pop') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(700, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    }
  } catch {
    // Audio feedback is optional.
  }
};
 // --- 纯文本范文数据 ---
const TASK1_MODEL = "Have you ever tried something absolutely terrifying? For the past week, I have been learning to rock climb. At first, I thought it would be effortless, but my arms were totally exhausted after just ten minutes! I initially avoided looking down. However, I promised to reach the top. When I finally hit the buzzer, it was such an amazing feeling that I forgot all my fear!";
 const topicModels = {
  kitchen: {
    title: "The Kitchen Disaster",
    icon: "🎂",
    fullText: "Have you ever wondered what a flour explosion looks like? It started with one small habit—watching baking shows on TV. For the past month, I have been trying to bake the perfect cake.\n\nIt hasn't been easy. So far, I have ruined three cakes! When I practice, the kitchen is often totally boiling, and I usually feel absolutely exhausted. Because it was so hard, I initially avoided using the oven again.\n\nHowever, I didn't give up. I promised to try baking one more time. When I finally did it, it was such a fascinating experience that I was so proud that I truly felt like a master chef.\n\nToday, I really enjoy sharing my cakes with friends. If you hope to find a delicious passion, you should definitely decide to start baking today!"
  },
  skate: {
    title: "The Skateboarding Fails",
    icon: "🛹",
    fullText: "Have you ever wondered what it feels like to kiss the concrete? It started with one small habit—watching skaters in the park. For the past two weeks, I have been learning to skateboard.\n\nIt hasn't been easy. So far, I have fallen off my board twenty times! When I practice, the concrete is absolutely freezing, and my legs usually feel totally exhausted. Because it was so hard, I initially avoided going down the big hill.\n\nHowever, I didn't give up. I promised to try the big hill one more time. When I finally did it, it was such a thrilling experience that I forgot the pain! I was going so fast that I truly felt like a champion.\n\nToday, I really enjoy cruising around the park. If you hope to find a cool new hobby, you should definitely decide to try skateboarding today!"
  },
  music: {
    title: "The Music Struggle",
    icon: "🎸",
    fullText: "Have you ever wondered why people torture their own fingers? It started with one small habit—listening to rock music. For the past year, I have been practicing the guitar.\n\nIt hasn't been easy. So far, I have broken three guitar strings! When I practice, the room is often absolutely freezing, and my fingers usually feel totally exhausted. Because it was so hard, I initially avoided playing complex chords.\n\nHowever, I didn't give up. I promised to try the hard song one more time. When I finally did it, it was such a beautiful experience that I almost cried! I was playing so perfectly that I truly felt like a rock star.\n\nToday, I really enjoy writing my own songs. If you hope to find a creative passion, you should definitely decide to pick up an instrument today!"
  }
};
 // --- 高定顶部组件 ---
const StudioLogo = () => (
  <div className="flex items-center space-x-2.5">
    <div className="relative flex items-center justify-center w-11 h-11 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-[14px] shadow-lg shadow-sky-500/20 border border-white/40 backdrop-blur-sm">
      <span className="text-white font-black text-xl font-cute leading-none tracking-tighter">Xy</span>
    </div>
    <div className="flex flex-col text-left justify-center">
      <span className="text-sky-900 font-sans font-black text-[14px] tracking-widest leading-none">XIAOYAO</span>
      <span className="text-[9px] text-sky-500 tracking-[0.3em] leading-none mt-1.5 font-bold uppercase">Studio</span>
    </div>
  </div>
);
 const Header = ({ headerRef, activeTab, setActiveTab, isMenuOpen, setIsMenuOpen }) => {
  const getSubTitle = () => {
    if(activeTab === 'overview') return "Mission Map";
    if(activeTab === 'task1') return "Task 1: Blog";
    return "Task 2: Column";
  };
   const tabs = [
    { id: 'overview', icon: 'fa-map-location-dot', label: '1. Mission Map' },
    { id: 'task1', icon: 'fa-blog', label: '2. Task 1: Blog' },
    { id: 'task2', icon: 'fa-bullseye', label: '3. Task 2: Column' }
  ];
  
  return (
    <header ref={headerRef} className="bg-white/85 backdrop-blur-2xl pt-10 pb-5 px-6 md:px-8 shadow-[0_4px_30px_rgb(0,0,0,0.03)] z-50 relative border-b border-white/50">
      <div className="relative z-10 flex justify-between items-center">
        
        {/* 左侧 Logo 组 */}
        <div className="flex items-center space-x-4">
          <StudioLogo />
          <div className="pl-4 border-l-2 border-slate-200/60 py-1">
            <h1 className="text-[1.2rem] font-black text-slate-800 leading-tight tracking-wide">Unit 6-4</h1>
            <p className="text-sky-500 text-[11px] mt-0.5 uppercase tracking-widest font-black">{getSubTitle()}</p>
          </div>
        </div>
        
        {/* 右侧 心跳羽毛菜单 */}
        <div className="relative">
          <button 
            onClick={() => { playTone('pop'); setIsMenuOpen(!isMenuOpen); }}
            className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all active-scale z-50 relative
              ${isMenuOpen 
                ? 'bg-slate-800 border-slate-700 text-white shadow-lg' 
                : 'bg-white border-sky-100 text-sky-500 shadow-md hover:text-sky-600 animate-heartbeat'}`}
          >
             <span aria-hidden="true" className={`fa-solid ${isMenuOpen ? 'fa-xmark text-xl' : 'fa-feather-pointed text-[22px]'}`}></span>
          </button>
           {/* 下拉玻璃质感菜单 */}
          {isMenuOpen && (
            <div className="absolute right-0 top-16 mt-2 w-56 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100/50 overflow-hidden menu-slide-down z-[100]">
              <div className="p-2.5 flex flex-col gap-1">
                <div className="px-3 pt-2 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Navigation</div>
                {tabs.map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => { playTone('pop'); setActiveTab(tab.id); setIsMenuOpen(false); }}
                    className={`w-full flex items-center px-4 py-3.5 rounded-xl text-[14px] font-black transition-all ${activeTab === tab.id ? 'bg-sky-50 text-sky-600 shadow-inner' : 'text-slate-600 hover:bg-slate-50 hover:text-sky-500'}`}
                  >
                    <span aria-hidden="true" className={`fa-solid ${tab.icon} w-7 text-left text-[16px] ${activeTab === tab.id ? 'text-sky-500' : 'text-slate-400'}`}></span> 
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 点击外部关闭遮罩 */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
      )}
    </header>
  );
};
 function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [selectedTopic, setSelectedTopic] = useState('kitchen');
  const [task1DraftText, setTask1DraftText] = useState("");
  const [task2DraftText, setTask2DraftText] = useState("");
   const headerRef = useRef(null);
   useEffect(() => {
    const handleViewportChange = () => window.requestAnimationFrame(syncViewportHeight);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange);
    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
    };
  }, []);
  useEffect(() => {
    const updateHeaderHeight = () => {
      const nextHeight = Math.ceil(headerRef.current?.offsetHeight || 100);
      getPageRoot()?.style.setProperty('--header-height', `${nextHeight}px`);
    };
    updateHeaderHeight();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(updateHeaderHeight) : null;
    if (headerRef.current && observer) observer.observe(headerRef.current);
    return () => observer?.disconnect();
  }, [activeTab]);
   const renderContentBody = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="fade-in max-w-lg mx-auto">
              <h3 className="text-[1.4rem] font-black text-slate-800 mb-6 font-serif-novel tracking-wide flex items-center pl-1">
                <span className="text-xl mr-2 text-sky-500">1.</span> MISSION OVERVIEW
              </h3>
              
              {/* 复刻截图里的双卡片布局 */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                 <div className="bg-gradient-to-b from-sky-50 to-white border-2 border-sky-100 p-5 rounded-[1.5rem] relative shadow-sm h-full flex flex-col justify-between overflow-hidden group hover:border-sky-300 transition-colors">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-sky-400/5 rounded-bl-[100%]"></div>
                    <div>
                        <div className="flex items-center text-sky-500 mb-4">
                           <span aria-hidden="true" className="fa-solid fa-blog text-[26px]"></span>
                        </div>
                        <h4 className="font-black text-slate-800 text-[17px] leading-tight mb-2 font-serif-novel">Task 1:<br/>Blog Post</h4>
                        <p className="text-slate-500 text-[12px] font-bold leading-relaxed mb-6">
                          Goal: Write a short blog post (60-80 words) about a difficult new activity. Use extreme adjectives.
                        </p>
                    </div>
                    <span className="bg-sky-100 text-sky-700 text-[10px] font-black px-3 py-1.5 rounded-lg w-fit uppercase tracking-widest">Mini Challenge</span>
                 </div>
                 
                 <div className="bg-gradient-to-b from-rose-50 to-white border-2 border-rose-100 p-5 rounded-[1.5rem] relative shadow-sm h-full flex flex-col justify-between overflow-hidden group hover:border-rose-300 transition-colors">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-rose-400/5 rounded-bl-[100%]"></div>
                    <div>
                        <div className="flex items-center text-rose-500 mb-4">
                           <span aria-hidden="true" className="fa-solid fa-bullseye text-[26px]"></span>
                        </div>
                        <h4 className="font-black text-slate-800 text-[17px] leading-tight mb-2 font-serif-novel">Task 2:<br/>Life Column</h4>
                        <p className="text-slate-500 text-[12px] font-bold leading-relaxed mb-6">
                          Goal: Write a fun, engaging magazine column (120~160 words). Connect all grammar rules!
                        </p>
                    </div>
                    <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-3 py-1.5 rounded-lg w-fit uppercase tracking-widest">Main Boss</span>
                 </div>
              </div>
               <h3 className="text-[1.4rem] font-black text-slate-800 mb-6 font-serif-novel tracking-wide flex items-center pl-1">
                <span className="text-xl mr-2 text-indigo-500">2.</span> LOGIC MAP
              </h3>
              
              {/* 高级 UI 逻辑框架 */}
              <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-7 shadow-sm border border-slate-100 mb-4 relative">
                  <div className="absolute left-[42px] top-12 bottom-12 w-0.5 bg-slate-200/60 rounded-full"></div>
                  <div className="space-y-7 relative">
                     <div className="flex items-start gap-5 group">
                        <div className="w-9 h-9 rounded-full bg-sky-50 border-2 border-sky-300 text-sky-600 font-black flex items-center justify-center shrink-0 z-10 text-[14px] shadow-sm group-hover:scale-110 transition-transform">1</div>
                        <div className="pt-1.5">
                           <h5 className="font-black text-slate-800 text-[16px] tracking-wide">The Hook <span className="text-[12px] text-slate-400 font-normal ml-1">(引子)</span></h5>
                           <p className="text-[13px] text-slate-500 font-medium mt-1 leading-relaxed">Use a rhetorical question to start.</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-5 group">
                        <div className="w-9 h-9 rounded-full bg-orange-50 border-2 border-orange-300 text-orange-600 font-black flex items-center justify-center shrink-0 z-10 text-[14px] shadow-sm group-hover:scale-110 transition-transform">2</div>
                        <div className="pt-1.5">
                           <h5 className="font-black text-slate-800 text-[16px] tracking-wide">The Struggle <span className="text-[12px] text-slate-400 font-normal ml-1">(挣扎)</span></h5>
                           <p className="text-[13px] text-slate-500 font-medium mt-1 leading-relaxed">Use extreme adjectives & present perfect.</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-5 group">
                        <div className="w-9 h-9 rounded-full bg-rose-50 border-2 border-rose-300 text-rose-600 font-black flex items-center justify-center shrink-0 z-10 text-[14px] shadow-sm group-hover:scale-110 transition-transform">3</div>
                        <div className="pt-1.5">
                           <h5 className="font-black text-slate-800 text-[16px] tracking-wide">The Climax <span className="text-[12px] text-slate-400 font-normal ml-1">(高潮)</span></h5>
                           <p className="text-[13px] text-slate-500 font-medium mt-1 leading-relaxed">Use so/such...that for extreme emotions.</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-5 group">
                        <div className="w-9 h-9 rounded-full bg-emerald-50 border-2 border-emerald-300 text-emerald-600 font-black flex items-center justify-center shrink-0 z-10 text-[14px] shadow-sm group-hover:scale-110 transition-transform">4</div>
                        <div className="pt-1.5">
                           <h5 className="font-black text-slate-800 text-[16px] tracking-wide">The Takeaway <span className="text-[12px] text-slate-400 font-normal ml-1">(寄语)</span></h5>
                           <p className="text-[13px] text-slate-500 font-medium mt-1 leading-relaxed">Share present feeling & encourage readers.</p>
                        </div>
                     </div>
                  </div>
              </div>
          </div>
        );
       case 'task1':
        return (
          <div className="fade-in max-w-lg mx-auto">
              {/* Expert Model 杂志排版 */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 mb-8 shadow-sm border border-slate-100 relative">
                  <div className="absolute top-0 right-0 bg-sky-100 text-sky-700 text-[10px] font-black px-4 py-1.5 rounded-bl-[1rem] rounded-tr-[2rem] uppercase tracking-widest">Mini Challenge</div>
                  <div className="flex items-center mb-6 mt-1">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mr-3 shrink-0">
                         <span aria-hidden="true" className="fa-solid fa-star text-lg"></span>
                      </div>
                      <h5 className="font-black text-slate-800 text-[18px] font-serif-novel">Expert Model</h5>
                  </div>
                  
                  <div className="relative">
                    <span aria-hidden="true" className="fa-solid fa-quote-left absolute -top-2 -left-2 text-4xl text-slate-100 -z-10"></span>
                    <p className="text-slate-700 font-serif-novel text-[15px] md:text-[16px] leading-loose text-justify relative z-10 pl-2">
                      {TASK1_MODEL}
                    </p>
                  </div>
              </div>
               {/* Writing Area */}
              <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-slate-100/60">
                <h5 className="font-black text-slate-800 mb-4 flex items-center text-[16px] font-serif-novel"><span aria-hidden="true" className="fa-solid fa-pen-nib text-sky-500 mr-3 text-xl"></span> Your Turn</h5>
                <textarea 
                  value={task1DraftText}
                  onChange={(e) => setTask1DraftText(e.target.value)}
                  className="w-full h-56 writing-textarea rounded-2xl p-5 text-[15px] md:text-[16px] font-serif-novel text-slate-800"
                  placeholder="Type your short blog post here... (60-80 words)"
                ></textarea>
              </div>
          </div>
        );
       case 'task2': {
        const currentTopicData = topicModels[selectedTopic];
        
        return (
          <div className="fade-in max-w-lg mx-auto">
              
              {/* Topic Selector */}
              <div className="mb-8">
                 <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-4 pl-2 flex items-center"><span aria-hidden="true" className="fa-solid fa-layer-group mr-2"></span> Select a Topic</h4>
                 <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
                    {Object.entries(topicModels).map(([key, data]) => (
                       <button 
                         key={key}
                         onClick={() => {setSelectedTopic(key); playTone('pop');}}
                         className={`shrink-0 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl border-2 transition-all active-scale ${selectedTopic === key ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-sm' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                       >
                          <span className="text-xl">{data.icon}</span>
                          <span className="font-black text-[14px] whitespace-nowrap">{data.title}</span>
                       </button>
                    ))}
                 </div>
              </div>
               {/* Full Column Model 杂志排版 */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 mb-8 shadow-sm border border-slate-100 relative">
                  <div className="absolute top-0 right-0 bg-rose-100 text-rose-700 text-[10px] font-black px-4 py-1.5 rounded-bl-[1rem] rounded-tr-[2rem] uppercase tracking-widest">Main Boss</div>
                  
                  <div className="flex flex-col items-center mb-8 mt-2 border-b border-slate-100 pb-6">
                      <span className="text-[40px] mb-3">{currentTopicData.icon}</span>
                      <h1 className="text-center font-black text-[22px] text-slate-800 font-serif-novel leading-tight">{currentTopicData.title}</h1>
                      <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-3">Expert Column</p>
                  </div>
                  
                  <div className="text-slate-700 font-serif-novel text-[15px] md:text-[16px] leading-loose text-justify space-y-4">
                    {currentTopicData.fullText.split('\n\n').map((paragraph, idx) => (
                       <p key={idx} className={idx === 0 ? "" : "indent-6 md:indent-8"}>
                         {idx === 0 ? <span className="float-left text-[38px] font-black leading-[0.8] mr-2 text-rose-300 pt-1">{paragraph.charAt(0)}</span> : null}
                         {idx === 0 ? paragraph.substring(1) : paragraph}
                       </p>
                    ))}
                  </div>
              </div>
               {/* Writing Area */}
              <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-slate-100/60">
                <h5 className="font-black text-slate-800 mb-4 flex items-center text-[16px] font-serif-novel"><span aria-hidden="true" className="fa-solid fa-pen-nib text-rose-500 mr-3 text-xl"></span> Write Your Column</h5>
                <textarea 
                  value={task2DraftText}
                  onChange={(e) => setTask2DraftText(e.target.value)}
                  className="w-full h-80 writing-textarea rounded-2xl p-5 text-[15px] md:text-[16px] font-serif-novel text-slate-800"
                  placeholder={`Draft your column about "${currentTopicData.title}" here... (120-160 words)\n\nRemember to include:\n1. The Hook\n2. The Struggle\n3. The Climax\n4. The Takeaway`}
                ></textarea>
              </div>
          </div>
        );
      }
       default: return null;
    }
  };
   return (
    <div className="app-shell w-full h-full min-h-0 md:h-[90vh] md:max-h-[960px] md:max-w-[440px] lg:max-w-[480px] md:rounded-[2.5rem] font-sans relative shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden bg-mesh md:mx-auto border-8 border-slate-800/10">
      
      <div className="absolute inset-x-0 top-0 z-[60]">
         <Header headerRef={headerRef} activeTab={activeTab} setActiveTab={setActiveTab} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      </div>
      
      <div className="h-full min-h-0 overflow-hidden flex flex-col" style={{ paddingTop: 'var(--header-height)', boxSizing: 'border-box' }}>
        <div className="flex-1 min-h-0 overflow-y-auto pb-safe-bar relative z-10 no-scrollbar mobile-scroll p-5 md:p-8 fade-in">
            
            {renderContentBody()}
            
        </div>
      </div>
    </div>
  );
}


const A2PlusUnit64Review = () => {
  useLegacyLessonProgress(MODULE_ID);

  return (
    <>
      <style>{LEGACY_PAGE_STYLES}</style>
      <div className="legacy-react-a2plus-unit64 app-root">
        <App />
      </div>
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<A2PlusUnit64Review />);
