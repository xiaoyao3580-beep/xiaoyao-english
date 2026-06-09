(function () {
  const SUPABASE_URL = 'https://avffxvpwzpvlohoyqshb.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_Bk22JrUqpC4nd5ucHr9I8A_mvPk3uXc';
  const ROUTE_TO_MODULE = {
    A2ReadingTool: 'a2-reading-tool',
    A2VideoTool: 'a2-video-tool',
    A1ReadingTestUnit1: 'a1-reading-test-unit1',
    A1VideoTestUnit5: 'a1-video-test-unit5',
    Unit5Review: 'a1-plus-unit5-review',
    A1PlusUnit6Review: 'a1-plus-unit6-review',
    A1PlusUnit62Rem: 'a1-plus-unit6-2rem',
    A1PlusUnit63Review: 'a1-plus-unit6-3-review',
    A1PlusUnit64PostExamCheckin: 'a1-plus-unit6-4-post-exam-checkin',
    A2Unit1Review: 'a2-unit1-review',
    A2Unit2Review: 'a2-unit2-review',
    A2Unit22Rem: 'a2-unit2-2rem',
    A2Unit23Review: 'a2-unit2-3-review',
    A2Unit24PostExamCheckin: 'a2-unit2-4-post-exam-checkin',
    A2PlusUnit5Review: 'a2-plus-unit5-review',
    A2PlusUnit61Rem: 'a2-plus-unit6-1rem',
    A2PlusUnit62Review: 'a2-plus-unit6-2-review',
    A2PlusUnit63Review: 'a2-plus-unit6-3-review',
    A2PlusUnit64Review: 'a2-plus-unit6-4-review',
    F2Unit13Review: 'f2-unit13-review',
    F2Unit14Review: 'f2-unit14-review',
    F2Unit14Toolbox: 'f2-unit14-toolbox',
    F2Unit15Review: 'f2-unit15-review',
    F2Unit15Toolbox: 'f2-unit15-toolbox',
    SWSYUnit21Review: 'swsy-unit2-1-review',
    SWSYUnit22Review: 'swsy-unit2-2-review',
    SWSYUnit23Review: 'swsy-unit2-3-review',
    SWSYUnit31Review: 'swsy-unit3-1-review',
    SWSYUnit4Review: 'swsy-unit4-review',
    JuniorGrammarScrollTest: 'junior-grammar-scroll-test',
    JuniorGrammarScrollTest2: 'junior-grammar-scroll-test-2',
    EconomistSentenceLogicDiagnostic: 'economist-sentence-logic-diagnostic',
    PhoneticsReview: 'others-phonetics-review'
  };
  const COMPLETE_RE = /(提交|完成|保存|生成报告|查看结果|导出|下载|截图|交卷|打卡|Submit|Complete|Finish|Done|Save|Export|Download|Result|Report|Check.?in)/i;
  const RESULT_RE = /(答对题数|答对|正确率|准确率|完成时间|交卷时间|Total Points|Final Score|最终得分|Accuracy|Quiz Report|Magic Grade Report|Report Card|成绩报告|学习报告|结果报告|Score\s*\d+\s*\/\s*\d+)/i;
  const FINAL_RESULT_RE = /(答对题数|正确率|准确率|完成时间|交卷时间|Total Points|Final Score|最终得分|Accuracy|Quiz Report|Magic Grade Report|Report Card|成绩报告|学习报告|结果报告|查看报告|View Report)/i;
  const CORRECT_KEYS = ['correct_count','correctCount','correct','correctAnswers','correct_answers','right_count','rightCount','rightAnswers','rights'];
  const TOTAL_KEYS = ['total_count','totalCount','total','totalQuestions','total_questions','question_count','questionCount','questionsCount','item_count','itemCount'];
  const SCORE_KEYS = ['score','scorePercent','score_percent','accuracy','accuracyPercent','accuracy_percent','percent','percentage','rate','points','totalPoints','total_points','grade'];
  const sentKeys = new Map();
  const armedDocs = new WeakSet();
  const observedDocs = new WeakSet();
  const observerTimers = new WeakMap();
  let useExtendedGrowthLog = true;

  function readUser() {
    try { return JSON.parse(localStorage.getItem('xy_user') || 'null'); } catch { return null; }
  }
  function safeParent(fn) {
    try { return window.parent && window.parent !== window ? fn(window.parent) : ''; } catch { return ''; }
  }
  function moduleIdFromHash() {
    const part = String(location.hash || '').split('/').filter(Boolean).pop() || '';
    return ROUTE_TO_MODULE[part] || '';
  }
  function moduleId() {
    const params = new URLSearchParams(location.search);
    return params.get('hwId') ||
      document.body?.dataset?.moduleId ||
      safeParent(p => new URLSearchParams(p.location.search).get('hwId')) ||
      safeParent(p => p.document?.body?.dataset?.moduleId) ||
      moduleIdFromHash();
  }
  function moduleTitle() {
    return safeParent(p => p.document?.title) || document.title || moduleId();
  }
  function finiteNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'string') {
      const clean = value.trim().replace(/,/g, '');
      if (!clean) return null;
      const percent = clean.match(/^(-?\d+(?:\.\d+)?)\s*%$/);
      if (percent) return Number(percent[1]);
      const firstNumber = clean.match(/-?\d+(?:\.\d+)?/);
      if (firstNumber && clean.replace(firstNumber[0], '').trim().length <= 2) return Number(firstNumber[0]);
    }
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  function nestedValue(obj, keys) {
    const seen = new Set();
    const stack = [obj];
    while (stack.length) {
      const current = stack.shift();
      if (!current || typeof current !== 'object' || seen.has(current)) continue;
      seen.add(current);
      for (const key of keys) {
        if (current[key] !== undefined && current[key] !== null && current[key] !== '') return current[key];
      }
      for (const value of Object.values(current)) {
        if (value && typeof value === 'object') stack.push(value);
      }
    }
    return undefined;
  }
  function textOf(rootDoc) {
    const doc = rootDoc || document;
    return (doc.body && doc.body.innerText || '').replace(/\s+/g, ' ').slice(-8000);
  }
  function clampScore(value) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : null;
  }
  function clampPercent(value) {
    const n = finiteNumber(value);
    if (n === null) return null;
    return clampScore(n > 0 && n <= 1 ? n * 100 : n);
  }
  function metricsFromObject(item) {
    const source = item && typeof item === 'object' ? item : {};
    const correct = finiteNumber(nestedValue(source, CORRECT_KEYS));
    const total = finiteNumber(nestedValue(source, TOTAL_KEYS));
    const rawScore = clampPercent(nestedValue(source, SCORE_KEYS));
    const metrics = { score: rawScore, correct_count:null, total_count:null, confidence:0, evidence:'' };
    if (Number.isFinite(correct) && Number.isFinite(total) && total > 0 && correct >= 0 && correct <= total) {
      metrics.correct_count = correct;
      metrics.total_count = total;
      metrics.score = clampScore(correct / total * 100);
      metrics.confidence = 4;
      metrics.evidence = 'payload-fraction';
      return metrics;
    }
    if (rawScore !== null) {
      metrics.confidence = 2;
      metrics.evidence = 'payload-score';
    }
    return metrics;
  }
  function extractResultMetrics(rootDoc) {
    const text = textOf(rootDoc);
    const metrics = { score:null, correct_count:null, total_count:null, confidence:0, evidence:'' };
    const hasFinalResultWords = FINAL_RESULT_RE.test(text);
    const fractionPatterns = [
      /(?:答对题数|答对|Correct(?: Answers)?|correct(?: answers)?|Score|得分)[^\d]{0,48}(\d{1,3})\s*\/\s*(\d{1,3})/gi,
      /(\d{1,3})\s*\/\s*(\d{1,3})[^\d]{0,36}(?:题|道|correct|Correct|answered|Answers|Score|得分)/gi
    ];
    for (const pattern of fractionPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (!matches.length) continue;
      const last = matches[matches.length - 1];
      const correct = Number(last[1]);
      const total = Number(last[2]);
      if (Number.isFinite(correct) && Number.isFinite(total) && total > 0 && correct <= total) {
        metrics.correct_count = correct;
        metrics.total_count = total;
        metrics.score = Math.round(correct / total * 100);
        metrics.confidence = 4;
        metrics.evidence = 'dom-fraction';
        return metrics;
      }
    }
    const percentMatches = Array.from(text.matchAll(/(?:正确率|准确率|Accuracy)[^\d]{0,40}(\d{1,3})\s*%/gi));
    if (percentMatches.length) {
      metrics.score = clampScore(percentMatches[percentMatches.length - 1][1]);
      metrics.confidence = 3;
      metrics.evidence = 'dom-accuracy-percent';
    }
    if (metrics.score === null) {
      const scorePercentMatches = Array.from(text.matchAll(/(?:得分|成绩|Score|Result)[^\d]{0,40}(\d{1,3})\s*%/gi));
      if (hasFinalResultWords && scorePercentMatches.length) {
        metrics.score = clampScore(scorePercentMatches[scorePercentMatches.length - 1][1]);
        metrics.confidence = 2;
        metrics.evidence = 'dom-score-percent';
      }
    }
    if (metrics.score === null) {
      const points = Array.from(text.matchAll(/(?:Total Points|points)[^\d]{0,24}(\d{1,3})|(\d{1,3})\s*(?:Total Points|points)/gi));
      if (hasFinalResultWords && points.length) {
        const last = points[points.length - 1];
        metrics.score = clampScore(last[1] ?? last[2]);
        metrics.confidence = 2;
        metrics.evidence = 'dom-total-points';
      }
    }
    if (metrics.score === null) {
      const finalScores = Array.from(text.matchAll(/(?:Final Score|最终得分|最终成绩)[^\d]{0,32}(\d{1,4})/gi));
      if (hasFinalResultWords && finalScores.length) {
        metrics.score = clampScore(finalScores[finalScores.length - 1][1]);
        metrics.confidence = 2;
        metrics.evidence = 'dom-final-score';
      }
    }
    return metrics;
  }
  function responseJson(data, status = 201) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  function requestUrl(input) {
    try {
      if (typeof input === 'string') return input;
      if (input && input.url) return input.url;
    } catch {}
    return '';
  }
  function requestBody(input, init) {
    try {
      return init && init.body !== undefined ? init.body : (input && input.body !== undefined ? input.body : '');
    } catch {
      return '';
    }
  }
  function parseJsonBody(body) {
    if (!body) return null;
    if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) return Object.fromEntries(body.entries());
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      const data = {};
      body.forEach((value, key) => { data[key] = value; });
      return data;
    }
    if (typeof Blob !== 'undefined' && body instanceof Blob) return null;
    if (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream) return null;
    if (typeof ArrayBuffer !== 'undefined' && (body instanceof ArrayBuffer || ArrayBuffer.isView(body))) return null;
    if (typeof body === 'object') return body;
    if (typeof body !== 'string') return null;
    try { return JSON.parse(body); } catch {}
    if (body.includes('=') && typeof URLSearchParams !== 'undefined') {
      try { return Object.fromEntries(new URLSearchParams(body).entries()); } catch {}
    }
    return null;
  }
  async function requestJsonBody(input, init) {
    const direct = requestBody(input, init);
    const parsed = parseJsonBody(direct);
    if (parsed) return parsed;
    try {
      if (typeof direct === 'string') return JSON.parse(direct);
    } catch {}
    try {
      if (input && typeof input.clone === 'function') {
        const text = await input.clone().text();
        return parseJsonBody(text);
      }
    } catch {}
    return null;
  }
  function oldAttemptTable(url) {
    const text = String(url || '');
    if (/\/rest\/v1\/quiz_attempts(?:[/?]|$)/.test(text)) return 'quiz_attempts';
    if (/\/rest\/v1\/diagnostic_attempts(?:[/?]|$)/.test(text)) return 'diagnostic_attempts';
    if (/\/rest\/v1\/diagnostic_answers(?:[/?]|$)/.test(text)) return 'diagnostic_answers';
    return '';
  }
  function normalizeAttemptRow(row, table) {
    const item = row || {};
    const homeworkId = item.homework_id || item.homeworkId || item.module_id || item.moduleId || moduleId();
    const metrics = metricsFromObject(item);
    return {
      homework_id: homeworkId,
      score: metrics.score,
      correct_count: Number.isFinite(metrics.correct_count) ? metrics.correct_count : undefined,
      total_count: Number.isFinite(metrics.total_count) ? metrics.total_count : undefined,
      source: table === 'diagnostic_attempts' ? 'diagnostic' : 'quiz',
      event_type: table === 'diagnostic_attempts' ? 'diagnostic_complete' : 'quiz_complete',
      module_title: item.module_title || item.moduleTitle || moduleTitle(),
      require_metric: true,
      metadata: { legacyTable: table, legacyPayload: item, href: location.href, metrics }
    };
  }
  function isGrowthLogsUrl(url) {
    return /\/rest\/v1\/growth_logs(?:[/?]|$)/.test(String(url || ''));
  }
  function looksLikeResultUrl(url) {
    return /(quiz|diagnostic|attempt|result|score|submit|submission|answer|grade|record)/i.test(String(url || ''));
  }
  function payloadRows(body) {
    if (!body) return [];
    if (Array.isArray(body)) return body;
    if (body && typeof body === 'object') {
      for (const key of ['records','rows','items','attempts','submissions']) {
        if (Array.isArray(body[key])) return body[key];
      }
      if (body.data && typeof body.data === 'object') return Array.isArray(body.data) ? body.data : [body.data];
      return [body];
    }
    return [];
  }
  function resultPayloadCandidate(row) {
    const metrics = metricsFromObject(row);
    const homework = row && typeof row === 'object' && (row.homework_id || row.homeworkId || row.module_id || row.moduleId || moduleId() || row.lesson_id || row.lessonId);
    return !!homework && metrics.confidence >= 2;
  }
  function normalizeGenericResultRow(row, source) {
    const item = row || {};
    const metrics = metricsFromObject(item);
    return {
      homework_id: item.homework_id || item.homeworkId || item.module_id || item.moduleId || moduleId() || item.lesson_id || item.lessonId,
      score: metrics.score,
      correct_count: Number.isFinite(metrics.correct_count) ? metrics.correct_count : undefined,
      total_count: Number.isFinite(metrics.total_count) ? metrics.total_count : undefined,
      source: source || 'payload_bridge',
      event_type: item.event_type || item.eventType || 'score_complete',
      module_title: item.module_title || item.moduleTitle || item.lessonTitle || item.title || moduleTitle(),
      require_metric: true,
      metadata: { payloadBridge: true, payload: item, href: location.href, metrics }
    };
  }
  async function captureResultPayload(url, method, body, source) {
    if (String(method || 'GET').toUpperCase() === 'GET' || isGrowthLogsUrl(url) || !looksLikeResultUrl(url)) return [];
    const rows = payloadRows(parseJsonBody(body)).filter(resultPayloadCandidate);
    const recorded = [];
    for (const row of rows) {
      const result = await recordLesson(normalizeGenericResultRow(row, source));
      if (result && result.row) recorded.push(result.row);
    }
    return recorded;
  }
  function starsForScore(score) {
    const n = Number(score) || 0;
    if (n >= 100) return 5;
    if (n >= 85) return 3;
    if (n >= 70) return 2;
    if (n >= 60) return 1;
    return 0;
  }
  function extractScore(rootDoc) {
    return extractResultMetrics(rootDoc).score ?? 100;
  }
  function minimalGrowthRow(row) {
    return {
      student_id: row.student_id,
      homework_id: row.homework_id,
      score: row.score,
      stars_earned: row.stars_earned,
      attempt_count: row.attempt_count,
      is_best_score: row.is_best_score
    };
  }
  function objectOrNull(value) {
    if (!value) return null;
    if (typeof value === 'string') {
      try { value = JSON.parse(value); } catch { return null; }
    }
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  }
  function growthMetadata(payload, mergedMetrics, correctCount, totalCount) {
    const meta = objectOrNull(payload.metadata) || {};
    const report = objectOrNull(payload.report);
    return {
      ...meta,
      ...(report ? { report } : {}),
      href: meta.href || location.href,
      text: meta.text || payload.triggerText || '',
      metrics: { ...(meta.metrics || {}), ...mergedMetrics },
      correct_count: correctCount,
      total_count: totalCount
    };
  }
  async function insertGrowthLog(row) {
    const headers = {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    };
    const response = await fetch(SUPABASE_URL + '/rest/v1/growth_logs', {
      method: 'POST',
      headers,
      body: JSON.stringify(useExtendedGrowthLog ? row : minimalGrowthRow(row))
    });
    if (response.ok) return true;
    const text = await response.text().catch(() => '');
    if (/source|event_type|module_title|metadata|created_at|correct_count|total_count/i.test(text)) {
      useExtendedGrowthLog = false;
      const minimal = minimalGrowthRow(row);
      const retry = await fetch(SUPABASE_URL + '/rest/v1/growth_logs', {
        method: 'POST',
        headers,
        body: JSON.stringify(minimal)
      });
      if (retry.ok) return true;
      throw new Error(await retry.text().catch(() => 'growth_logs insert failed'));
    }
    throw new Error(text || 'growth_logs insert failed');
  }
  function isoOrNull(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  function normalizePracticeReportPayload(payload) {
    const user = readUser();
    if (!user || user.role !== 'student' || !user.id) return { error:'not-student' };
    const report = objectOrNull(payload.report) || objectOrNull(payload.metadata) || objectOrNull(payload) || {};
    const metrics = objectOrNull(report.metrics) || {};
    const homeworkId = payload.homework_id || payload.homeworkId || report.homework_id || report.homeworkId || moduleId();
    if (!homeworkId) return { error:'missing-homework-id' };
    const score = clampScore(payload.score ?? metrics.confidence ?? report.score ?? 0);
    return {
      row:{
        student_id:String(user.id),
        homework_id:String(homeworkId),
        module_title:payload.module_title || payload.moduleTitle || report.module_title || report.moduleTitle || moduleTitle(),
        score,
        correct_count:finiteNumber(payload.correct_count ?? payload.correctCount ?? metrics.first_cloze_pass ?? metrics.correct_count),
        total_count:finiteNumber(payload.total_count ?? payload.totalCount ?? metrics.total_phrases ?? metrics.total_count),
        started_at:isoOrNull(report.started_at || report.startedAt),
        finished_at:isoOrNull(report.finished_at || report.finishedAt),
        duration_seconds:finiteNumber(report.duration_seconds || report.durationSeconds || metrics.duration_seconds),
        summary:metrics,
        phrase_details:Array.isArray(report.phrase_details) ? report.phrase_details : [],
        attempts:Array.isArray(report.attempts) ? report.attempts : [],
        raw_report:report,
        source:payload.source || 'lesson_bridge',
        created_at:new Date().toISOString()
      }
    };
  }
  async function recordPracticeReport(payload) {
    const normalized = normalizePracticeReportPayload(payload || {});
    if (normalized.error) return { skipped:normalized.error };
    const headers = {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    };
    const response = await fetch(SUPABASE_URL + '/rest/v1/student_practice_reports', {
      method:'POST',
      headers,
      body:JSON.stringify(normalized.row)
    });
    if (response.ok) {
      const rows = await response.json().catch(() => []);
      const row = Array.isArray(rows) ? rows[0] : rows;
      window.dispatchEvent(new CustomEvent('xy:practice-report-recorded', { detail:row || normalized.row }));
      return { ok:true, row:row || normalized.row };
    }
    const text = await response.text().catch(() => '');
    console.warn('[xy-record-bridge] practice report failed:', text);
    return { error:new Error(text || 'practice report insert failed') };
  }
  async function recordLesson(payload, sourceDoc) {
    const user = readUser();
    if (!user || user.role !== 'student' || !user.id) return { skipped: 'not-student' };
    const homeworkId = payload.homework_id || payload.homeworkId || payload.module_id || payload.moduleId || moduleId();
    if (!homeworkId) return { skipped: 'missing-homework-id' };
    const payloadMetrics = metricsFromObject(payload);
    const docMetrics = extractResultMetrics(sourceDoc);
    const correctCount = Number.isFinite(payloadMetrics.correct_count) ? payloadMetrics.correct_count : docMetrics.correct_count;
    const totalCount = Number.isFinite(payloadMetrics.total_count) ? payloadMetrics.total_count : docMetrics.total_count;
    const payloadScore = payloadMetrics.score;
    const hasFraction = Number.isFinite(correctCount) && Number.isFinite(totalCount) && totalCount > 0;
    const hasTrustedMetrics = hasFraction || payloadMetrics.confidence >= 2 || docMetrics.confidence >= 2;
    if ((payload.triggerText === 'result-observer' || payload.require_metric) && !hasTrustedMetrics) return { skipped: 'unverified-result' };
    const score = clampScore(payloadScore ?? (hasFraction ? Math.round(correctCount / totalCount * 100) : docMetrics.score) ?? 100);
    const mergedMetrics = payloadMetrics.confidence > docMetrics.confidence
      ? { ...docMetrics, ...payloadMetrics, payload:payloadMetrics }
      : { ...docMetrics, payload:payloadMetrics };
    const key = user.id + ':' + homeworkId + ':' + score + ':' + (correctCount ?? '') + ':' + (totalCount ?? '') + ':' + (payload.event_type || payload.eventType || 'complete');
    const last = sentKeys.get(key) || 0;
    if (Date.now() - last < 15000) return { skipped: 'duplicate' };
    const storageKey = 'xy_lesson_record_sent:' + key;
    const sharedLast = Number(localStorage.getItem(storageKey) || 0);
    if (Date.now() - sharedLast < 15000) return { skipped: 'duplicate-shared' };
    sentKeys.set(key, Date.now());
    localStorage.setItem(storageKey, String(Date.now()));
    const row = {
      student_id: String(user.id),
      homework_id: String(homeworkId),
      score,
      stars_earned: Number(payload.stars_earned ?? payload.starsEarned ?? starsForScore(score)) || 0,
      attempt_count: Number(payload.attempt_count ?? payload.attemptCount ?? 1) || 1,
      is_best_score: payload.is_best_score ?? payload.isBestScore ?? true,
      correct_count: correctCount,
      total_count: totalCount,
      source: payload.source || 'lesson_bridge',
      event_type: payload.event_type || payload.eventType || 'complete',
      module_title: payload.module_title || payload.moduleTitle || moduleTitle(),
      metadata: growthMetadata(payload, mergedMetrics, correctCount, totalCount),
      created_at: new Date().toISOString()
    };
    if (!Number.isFinite(row.correct_count)) delete row.correct_count;
    if (!Number.isFinite(row.total_count)) delete row.total_count;
    try {
      await insertGrowthLog(row);
      window.dispatchEvent(new CustomEvent('xy:lesson-recorded', { detail: row }));
      return { ok: true, row };
    } catch (error) {
      localStorage.removeItem(storageKey);
      console.warn('[xy-record-bridge] growth log failed:', error);
      return { error };
    }
  }

  const nativeFetch = window.fetch ? window.fetch.bind(window) : null;
  if (nativeFetch && !window.__xy_growth_fetch_bridge_installed) {
    window.__xy_growth_fetch_bridge_installed = true;
    window.fetch = async function(input, init) {
      const url = requestUrl(input);
      const table = oldAttemptTable(url);
      const method = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();
      if (table && method !== 'GET') {
        const body = await requestJsonBody(input, init);
        if (table === 'diagnostic_answers') return responseJson([], 201);
        const rows = Array.isArray(body) ? body : [body || {}];
        const recorded = [];
        for (const row of rows) {
          const result = await recordLesson(normalizeAttemptRow(row, table));
          if (result && result.row) recorded.push(result.row);
        }
        const headers = (init && init.headers) || (input && input.headers) || {};
        const headerValue = name => headers && typeof headers.get === 'function' ? headers.get(name) : (headers[name] || headers[name.toLowerCase()] || '');
        const prefer = String(headerValue('Prefer') || '');
        const accept = String(headerValue('Accept') || '');
        const wantsRepresentation = /select=/.test(url) || prefer.includes('return=representation');
        const wantsSingle = /vnd\.pgrst\.object/i.test(accept);
        const first = rows[0] || {};
        const fake = {
          id: (recorded[0] && recorded[0].id) || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
          ...first,
          created_at: first.created_at || new Date().toISOString()
        };
        return responseJson(wantsSingle ? fake : (wantsRepresentation ? [fake] : recorded), 201);
      }
      if (method !== 'GET' && !isGrowthLogsUrl(url) && looksLikeResultUrl(url)) {
        const body = await requestJsonBody(input, init);
        if (body) await captureResultPayload(url, method, body, 'fetch_payload');
      }
      return nativeFetch(input, init);
    };
  }

  if (window.XMLHttpRequest && !window.__xy_growth_xhr_bridge_installed) {
    window.__xy_growth_xhr_bridge_installed = true;
    const proto = window.XMLHttpRequest.prototype;
    const nativeOpen = proto.open;
    const nativeSend = proto.send;
    proto.open = function(method, url) {
      this.__xy_growth_method = method;
      this.__xy_growth_url = url;
      return nativeOpen.apply(this, arguments);
    };
    proto.send = function(body) {
      try {
        captureResultPayload(this.__xy_growth_url, this.__xy_growth_method, body, 'xhr_payload').catch(() => {});
      } catch {}
      return nativeSend.apply(this, arguments);
    };
  }

  window.XY_RECORD_LESSON = recordLesson;
  window.XY_RECORD_SCORE = payload => recordLesson({ ...(payload || {}), source:'manual_api', event_type:(payload && (payload.event_type || payload.eventType)) || 'score_complete', require_metric:true });
  window.XY_RECORD_PRACTICE_REPORT = payload => recordPracticeReport({ ...(payload || {}), source:'manual_api' });
  function scheduleRecord(payload, doc) {
    [700, 1600, 3200].forEach(delay => {
      window.setTimeout(() => recordLesson(payload, doc), delay);
    });
  }
  window.addEventListener('message', event => {
    const data = event.data || {};
    if (data && /^(xy:lesson-complete|xy:score|xy:quiz-complete|lesson-complete|quiz-complete|score-complete)$/i.test(String(data.type || data.event || ''))) {
      recordLesson({ ...(data.payload || data), require_metric: String(data.type || data.event || '').includes('score') });
    }
  });
  function armResultObserver(doc) {
    if (!doc || observedDocs.has(doc) || !doc.body || !window.MutationObserver) return;
    observedDocs.add(doc);
    const observer = new MutationObserver(() => {
      const text = textOf(doc);
      if (!RESULT_RE.test(text)) return;
      const metrics = extractResultMetrics(doc);
      if (metrics.confidence < 2) return;
      const existing = observerTimers.get(doc);
      if (existing) window.clearTimeout(existing);
      observerTimers.set(doc, window.setTimeout(() => recordLesson({ triggerText:'result-observer', event_type:'complete' }, doc), 500));
    });
    observer.observe(doc.body, { childList:true, subtree:true, characterData:true });
  }
  function armDocument(doc) {
    if (!doc || armedDocs.has(doc)) return;
    armedDocs.add(doc);
    armResultObserver(doc);
    doc.addEventListener('click', event => {
      const target = event.target && event.target.closest && event.target.closest('button,a,[role="button"]');
      if (!target) return;
      const text = (target.innerText || target.textContent || target.getAttribute('aria-label') || target.title || '').trim();
      if (!COMPLETE_RE.test(text)) return;
      scheduleRecord({ triggerText: text, event_type: 'complete' }, doc);
    }, true);
  }
  function armFrames(doc) {
    try {
      Array.from((doc || document).querySelectorAll('iframe')).forEach(frame => {
        try {
          const childDoc = frame.contentDocument || frame.contentWindow?.document;
          if (childDoc) {
            armDocument(childDoc);
            armFrames(childDoc);
          }
        } catch {}
      });
    } catch {}
  }

  armDocument(document);
  window.setInterval(() => armFrames(document), 1000);
  document.addEventListener('DOMContentLoaded', () => armFrames(document));
})();
