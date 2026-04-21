/* ================================================================
   肖瑶启言 · 学习中心 · 数据配置文件
   ================================================================
   
   📝 这个文件是你平时唯一需要维护的地方。
   所有学生、密码、作业,全在这里。
   
   改完之后:保存 → 上传到 GitHub → 自动部署,30秒后生效。
   
   ================================================================
   目录:
   1. STUDENTS      - 学生名册
   2. TEACHER       - 老师账号
   3. CLASSES_CONFIG - 班级配置(一般不用改)
   4. HOMEWORK      - 作业列表 ⭐ 每周更新这里
   5. NEWS_DATA     - 首页新闻
   ================================================================
*/


/* ================================================================
   1️⃣ 学生名册
   ================================================================
   
   👉 怎么加学生:
      复制一行 { ... },修改 id、password、classes、name 即可
   
   👉 id 格式:
      "S01"、"S02" 等(英文字母+数字,不要重复)
   
   👉 password 格式:
      4 位数字(每个学生的密码必须不同)
   
   👉 classes 格式:
      学生所在班级的代号数组,可以多个(跨班学生)
      可选代号:'adult', 'swsy', 'f2', 'a2-1', 'a1-plus', 'ms', 'econ', 'a2-plus', 'a2-2'
   
   👉 name:
      学生真实姓名(只显示给自己看,不会暴露给其他学生)
*/
const STUDENTS = [
  {
    id: "S01",
    password: "1234",
    name: "学生01",             // 可以改成真实姓名,比如 "张小明"
    classes: ["a2-1"]           // 该学生所在的班级(可以多个)
  },
  {
    id: "S02",
    password: "2345",
    name: "学生02",
    classes: ["a2-1"]
  },
  {
    id: "S03",
    password: "3456",
    name: "学生03",
    classes: ["a2-1"]
  },
  
  // 👇 在这里继续添加新学生(参考上面的格式)
  // {
  //   id: "S04",
  //   password: "4567",
  //   name: "学生04",
  //   classes: ["a2-1"]
  // },
  // 
  // 👇 跨班学生示例(同时上两个班):
  // {
  //   id: "S05",
  //   password: "5678",
  //   name: "跨班学生示例",
  //   classes: ["a2-1", "f2"]    // ← 数组里写多个班级代号
  // },
];


/* ================================================================
   2️⃣ 老师账号
   ================================================================
   登录后可以进入管理后台
*/
const TEACHER = {
  username: "xiaoyao",
  password: "929292",
  name: "肖瑶老师"
};


/* ================================================================
   3️⃣ 班级配置(一般不用改)
   ================================================================
   每个班级的名字、时间、颜色、图标
*/
const CLASSES_CONFIG = [
  {
    code: 'adult',
    name: '成人0基础口语',
    level: 'ADULT · ZERO BASE',
    time: '周四下午',
    icon: 'fa-briefcase',
    gradient: 'from-violet-600 to-purple-700',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600'
  },
  {
    code: 'swsy',
    name: '深外素养',
    level: 'SWSY · ELITE',
    time: '周四晚上',
    icon: 'fa-crosshairs',
    gradient: 'from-indigo-600 to-violet-700',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600'
  },
  {
    code: 'f2',
    name: 'F2班',
    level: 'TALENT F2 · FOUNDATION',
    time: '周五晚上',
    icon: 'fa-baby',
    gradient: 'from-pink-500 to-rose-500',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600'
  },
  {
    code: 'a2-1',
    name: 'A2班(1班)',
    level: 'TALENT A2 · INTERMEDIATE',
    time: '周六早上',
    icon: 'fa-graduation-cap',
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600'
  },
  {
    code: 'a1-plus',
    name: 'A1+班',
    level: 'TALENT A1+ · BEGINNER+',
    time: '周六下午',
    icon: 'fa-star',
    gradient: 'from-amber-400 to-yellow-500',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600'
  },
  {
    code: 'ms',
    name: '初中能力提升',
    level: 'MIDDLE SCHOOL · ADVANCED',
    time: '周六下午',
    icon: 'fa-trophy',
    gradient: 'from-purple-600 to-fuchsia-600',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  {
    code: 'econ',
    name: '经济学人班',
    level: 'ECONOMIST · PREMIUM',
    time: '周六晚上',
    icon: 'fa-newspaper',
    gradient: 'from-rose-600 to-pink-700',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600'
  },
  {
    code: 'a2-plus',
    name: 'A2+班',
    level: 'TALENT A2+ · ADVANCED',
    time: '周日早上',
    icon: 'fa-rocket',
    gradient: 'from-violet-600 to-indigo-700',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-700'
  },
  {
    code: 'a2-2',
    name: 'A2班(2班)',
    level: 'TALENT A2 · INTERMEDIATE',
    time: '周日下午',
    icon: 'fa-book',
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600'
  }
];


/* ================================================================
   4️⃣ 作业列表 ⭐⭐⭐
   ================================================================
   
   👉 每周更新作业时,在这里改
   
   👉 每份作业的字段说明:
      id          - 作业唯一编号(比如 "a2-1-u6-1"),不能重复
      classCode   - 属于哪个班级(代号)
      unit        - 单元(显示用,比如 "U6-1")
      title       - 作业标题
      file        - 作业 HTML 文件路径(相对路径)
      date        - 发布日期
      status      - 状态:
                     'open'   = 开放给学生看 ✅
                     'hidden' = 隐藏(学生看不到)❌
   
   👉 老师也可以在后台管理界面点开关来一键切换 status
      (临时修改保存在浏览器本地,要让所有学生看到需要改这个文件)
*/
const HOMEWORK = [
  {
    id: "a2-1-u6-1",
    classCode: "a2-1",
    unit: "U6-1",
    title: "The Life Columnist",
    file: "classes/a2-1/A2_U6-1.html",
    date: "2026-04-20",
    status: "open"     // 当前对 A2-1 班开放
  },
  
  // 👇 添加新作业时,复制上面的格式粘贴在下面
  // {
  //   id: "a2-1-u6-2",
  //   classCode: "a2-1",
  //   unit: "U6-2",
  //   title: "下一单元标题",
  //   file: "classes/a2-1/A2_U6-2.html",
  //   date: "2026-04-27",
  //   status: "open"
  // },
];


/* ================================================================
   5️⃣ 首页新闻
   ================================================================
   首页顶部的新闻轮播
*/
const NEWS_DATA = [
  {
    title: "肖瑶老师说",
    subtitle: "致所有正在学英语的孩子",
    content: "英语不是一门考试学科,而是一种真正能用的能力。我们更看重孩子敢说、会说、说得漂亮——这才是十年后还能留在孩子身上的东西。",
    date: "2026-04-21",
    image: "",
    link: "",
    bgColor: "from-violet-600 to-purple-600",
    tag: "教育理念"
  },
  {
    title: "本周教学重点",
    subtitle: "口语素养 · 情境表达",
    content: "本周各班聚焦'生活化情境表达'训练,让孩子能把学过的句型在真实场景里自然说出来。家长可以在家配合做'角色扮演'小练习。",
    date: "2026-04-20",
    image: "",
    link: "",
    bgColor: "from-pink-500 to-rose-500",
    tag: "本周重点"
  },
  {
    title: "肖瑶启言 · 工作室动态",
    subtitle: "10年专注青少年英语",
    content: "从2016年至今,陪伴了数百个孩子的英语成长。感谢每一位家长的信任。我们继续用小班精品 + 口语输出 + 专业纠音,把每个孩子的英语真正做扎实。",
    date: "2026-04-19",
    image: "",
    link: "",
    bgColor: "from-amber-400 to-orange-500",
    tag: "工作室动态"
  }
];


/* ================================================================
   ⚠️ 自动检测(不用改)
   启动时检查密码/账号是否重复,防止bug
   ================================================================
*/
(function checkDataIntegrity() {
  if (typeof window === 'undefined') return; // 非浏览器环境跳过
  
  // 检测密码重复
  const passwords = STUDENTS.map(s => s.password);
  const duplicatePasswords = passwords.filter((p, i) => passwords.indexOf(p) !== i);
  if (duplicatePasswords.length > 0) {
    console.error('⚠️ 学生密码重复:', duplicatePasswords);
    alert('⚠️ 学生名册里有密码重复,请检查 data.js 文件!\n重复的密码:' + duplicatePasswords.join(', '));
  }
  
  // 检测账号重复
  const ids = STUDENTS.map(s => s.id);
  const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicateIds.length > 0) {
    console.error('⚠️ 学生账号重复:', duplicateIds);
    alert('⚠️ 学生名册里有账号重复,请检查 data.js 文件!\n重复的账号:' + duplicateIds.join(', '));
  }
  
  // 检测班级代号是否存在
  const validCodes = CLASSES_CONFIG.map(c => c.code);
  STUDENTS.forEach(s => {
    s.classes.forEach(code => {
      if (!validCodes.includes(code)) {
        console.error(`⚠️ 学生 ${s.id} 的班级代号 "${code}" 不存在`);
      }
    });
  });
  
  HOMEWORK.forEach(hw => {
    if (!validCodes.includes(hw.classCode)) {
      console.error(`⚠️ 作业 ${hw.id} 的班级代号 "${hw.classCode}" 不存在`);
    }
  });
  
  console.log(`✅ 数据检查通过:${STUDENTS.length}学生 · ${CLASSES_CONFIG.length}班级 · ${HOMEWORK.length}作业`);
})();
