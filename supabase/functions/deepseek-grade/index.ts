const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
  if (!apiKey) {
    return json({ error: "DEEPSEEK_API_KEY is not configured in Supabase Secrets." }, 500);
  }

  let payload: {
    systemPrompt?: string;
    userPrompt?: string;
    model?: string;
    temperature?: number;
    max_tokens?: number;
  };

  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const systemPrompt = String(payload.systemPrompt || "").trim();
  const userPrompt = String(payload.userPrompt || "").trim();
  if (!systemPrompt || !userPrompt) {
    return json({ error: "systemPrompt and userPrompt are required." }, 400);
  }

  try {
    const requestBody = {
      model: payload.model || Deno.env.get("DEEPSEEK_MODEL") || "deepseek-v4-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      thinking: { type: "disabled" },
      stream: false,
      max_tokens: Number(payload.max_tokens || 2200),
      temperature: Number(payload.temperature ?? 0.25),
    };

    let upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    let data = await parseJsonResponse(upstream);

    if (!upstream.ok) {
      return json({
        error: data?.error?.message || `DeepSeek service failed (${upstream.status}).`,
        status: upstream.status,
      }, upstream.status);
    }

    let content = extractContent(data);
    if (!content && requestBody.model !== "deepseek-v4-flash") {
      upstream = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ ...requestBody, model: "deepseek-v4-flash" }),
      });
      data = await parseJsonResponse(upstream);
      if (!upstream.ok) {
        return json({
          error: data?.error?.message || `DeepSeek service failed (${upstream.status}).`,
          status: upstream.status,
        }, upstream.status);
      }
      content = extractContent(data);
    }

    if (!content) {
      const finishReason = data?.choices?.[0]?.finish_reason || "unknown";
      return json({
        error: `批改服务没有返回文字内容，请重试。finish_reason: ${finishReason}`,
      }, 502);
    }

    return json({ content });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown error." }, 500);
  }
});

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function parseJsonResponse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function extractContent(data: any) {
  const choice = data?.choices?.[0];
  const message = choice?.message || {};
  return String(
    message.content ||
      message.reasoning_content ||
      choice?.text ||
      ""
  ).trim();
}
