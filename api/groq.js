module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Missing GROQ_API_KEY" }));
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  const messages = body.messages;
  const model = body.model || "llama-3.1-8b-instant";
  const temperature = typeof body.temperature === "number" ? body.temperature : 0.7;
  const max_tokens = typeof body.max_tokens === "number" ? body.max_tokens : 500;

  if (!Array.isArray(messages)) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "messages must be an array" }));
    return;
  }

  const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens,
      messages,
    }),
  });

  const payload = await groqResponse.json();

  res.statusCode = groqResponse.status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};