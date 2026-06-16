const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

function assertEnv() {
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    throw new Error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN");
  }
}

async function pipeline(commands) {
  assertEnv();
  const r = await fetch(`${UPSTASH_REDIS_REST_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    // ВАЖНО: Upstash ждёт массив массивов команд
    body: JSON.stringify(commands),
  });

  const data = await r.json();
  if (!r.ok) {
    throw new Error(`Upstash error ${r.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function upstash(cmd, ...args) {
  const out = await pipeline([[cmd, ...args]]);
  return out?.[0]?.result;
}

async function upstashPipeline(commands) {
  const out = await pipeline(commands);
  return out.map((x) => x.result);
}

export { upstash, upstashPipeline };
