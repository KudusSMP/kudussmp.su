const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

function assertEnv() {
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    throw new Error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN");
  }
}

async function upstash(cmd, ...args) {
  assertEnv();
  const payload = { command: [cmd, ...args] };
  const r = await fetch(`${UPSTASH_REDIS_REST_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([payload]),
  });

  const data = await r.json();
  if (!r.ok) throw new Error(`Upstash error ${r.status}: ${JSON.stringify(data)}`);
  return data?.[0]?.result;
}

async function upstashPipeline(commands) {
  assertEnv();
  const payload = commands.map((c) => ({ command: c }));
  const r = await fetch(`${UPSTASH_REDIS_REST_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await r.json();
  if (!r.ok) throw new Error(`Upstash error ${r.status}: ${JSON.stringify(data)}`);
  return data.map((x) => x.result);
}

export { upstash, upstashPipeline };
