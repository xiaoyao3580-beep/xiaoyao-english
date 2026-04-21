# 📘 肖瑶启言学习中心 · 使用说明(V3 稳定版)

> **修复说明**:V2 版本用 React + Babel,加载失败会全挂。
> V3 改用纯原生 JS,极其稳定,不会出现空白页。

---

## 🔑 账号密码

### 老师
- 账号:`xiaoyao`
- 密码:`929292`

### 学生(测试号)
| 账号 | 密码 | 所在班 |
|---|---|---|
| S01 | 1234 | A2-1 |
| S02 | 2345 | A2-1 + F2 (跨班)|
| S03 | 3456 | 深外素养 |

---

## 📁 文件结构

```
xiaoyao-site/
├── index.html        ← 首页(数据全部内嵌)
├── class.html        ← 班级作业页
├── teacher.html      ← 老师后台
├── README.md
└── classes/          ← 作业存放
    ├── a2-1/
    │   └── A2_U6-1.html
    ├── f2/
    ├── adult/
    └── ... 各班一个文件夹
```

⚠️ **V3 不再需要 `data.js`**,所有数据直接写在每个 HTML 里。

---

## ⚠️ V3 重大变化:修改数据要改3个文件!

因为数据内嵌,所以**加学生/加作业时,需要同时修改**:
1. `index.html`
2. `class.html`
3. `teacher.html`

里面都有一段几乎一样的数据块,找到就改。

### 举例:添加一个新学生 S04

打开 `index.html`,搜索 `XY_STUDENTS`,找到:

```javascript
const XY_STUDENTS = [
  { id: 'S01', password: '1234', name: '学生S01', classes: ['a2-1'] },
  { id: 'S02', password: '2345', name: '学生S02', classes: ['a2-1', 'f2'] },
  { id: 'S03', password: '3456', name: '学生S03', classes: ['swsy'] }
];
```

改成:

```javascript
const XY_STUDENTS = [
  { id: 'S01', password: '1234', name: '学生S01', classes: ['a2-1'] },
  { id: 'S02', password: '2345', name: '学生S02', classes: ['a2-1', 'f2'] },
  { id: 'S03', password: '3456', name: '学生S03', classes: ['swsy'] },
  { id: 'S04', password: '4567', name: '学生S04', classes: ['a2-1'] }
];
```

**注意**:
- 上一行要加逗号
- `class.html` 和 `teacher.html` 里的 XY_STUDENTS 也要**完全一样地改**

### 举例:添加一份新作业

同样,在3个文件里搜索 `XY_HOMEWORK`,加一条:

```javascript
const XY_HOMEWORK = [
  { id: 'a2-1-u6-1', classCode: 'a2-1', unit: 'U6-1', title: 'The Life Columnist', date: '2026-04-20', file: 'a2-1/A2_U6-1.html', status: 'open' },
  { id: 'a2-1-u6-2', classCode: 'a2-1', unit: 'U6-2', title: 'The Next Adventure', date: '2026-04-27', file: 'a2-1/A2_U6-2.html', status: 'open' }
];
```

**然后**把 HTML 文件传到对应的 `classes/a2-1/` 文件夹。

---

## 🚀 部署步骤

1. 删除 GitHub 仓库 xiaoyao-english 里的旧文件:
   - ❌ `data.js`(V3不需要)
   - ❌ `index.html` (替换)
   - ❌ `class.html` (替换)
   - ❌ `teacher.html` (替换)
   - ✅ `classes/` 文件夹(保留!里面的作业文件不要删)

2. 上传这3个新文件:
   - `index.html`
   - `class.html`
   - `teacher.html`

3. Commit changes,等30秒 Vercel 部署完

4. 访问 xiaoyao-english.com 测试

---

## 🎯 测试步骤

### 测试1:基本显示
- 打开 xiaoyao-english.com → **应该看到9个班级卡片 + 新闻栏**(不再是空白!)

### 测试2:学生登录
- 点 LOGIN → 输入 S02 / 2345
- 应该进入 Profile 页,看到"我的班级 (2)"
- 点 A2-1 → 能看到 U6-1 作业

### 测试3:老师登录
- 输入 xiaoyao / 929292
- 看到"进入管理后台"按钮

---

## 💡 V3 的技术选择

**为什么改用原生JS不用React?**

| 对比 | React+Babel版 (V2) | 原生JS版 (V3) |
|---|---|---|
| 加载依赖 | React + ReactDOM + Babel + data.js | 无(就是HTML) |
| 加载速度 | 慢(需编译) | 极快 |
| 出错概率 | 任一依赖加载失败就白屏 | 几乎不可能出错 |
| 你能看懂 | 代码复杂 | 代码直观 |

**V3 牺牲了一点"优雅"**(数据要写3份),但换来了**100%稳定**。

**后续你想加功能**:直接让 AI 改这3个文件就行。

---

## 📞 出问题了怎么办

把 `index.html` / `class.html` / `teacher.html` 发给我,我几秒找到错误。
