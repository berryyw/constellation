const express = require("express")
const cors = require("cors")
const app = express()
const origins = String(process.env.CORS_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean)
app.use(cors({ origin: (origin, cb) => {
  if (!origin) return cb(null, true)
  if (origins.length === 0) return cb(null, true)
  cb(null, origins.includes(origin))
} }))
const { generateHoroscope } = require('./clients/llmClient')
const { buildPrompt } = require('./prompts/horoscopePrompt')
const USE_LLM = String(process.env.USE_LLM || '').toLowerCase() === 'true'
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'openai-compatible'
const LLM_API_KEY = process.env.LLM_API_KEY || ''
const LLM_MODEL = process.env.LLM_MODEL || ''
const LLM_BASE_URL = process.env.LLM_BASE_URL || ''
const LLM_TIMEOUT = Number(process.env.LLM_TIMEOUT || 15000)
const CACHE_TTL = Number(process.env.LLM_CACHE_TTL || 86400)
const cache = new Map()
const nowSec = () => Math.floor(Date.now() / 1000)
const getCache = k => {
  const v = cache.get(k)
  if (!v) return null
  if (v.exp <= nowSec()) { cache.delete(k); return null }
  return v.data
}
const setCache = (k, data, ttlSec) => cache.set(k, { data, exp: nowSec() + (ttlSec || CACHE_TTL) })
const rate = new Map()
const RATE_LIMIT = Number(process.env.RATE_LIMIT_PER_MIN || 60)
setInterval(() => rate.clear(), 60 * 1000)
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown'
  const c = (rate.get(ip) || 0) + 1
  rate.set(ip, c)
  if (c > RATE_LIMIT) return res.status(429).json({ error: 'rate_limited' })
  next()
})
const hash = s => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = (h >>> 0) * 16777619
  }
  return h >>> 0
}
const rng = seed => {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ t >>> 15, 1 | t)
    r ^= r + Math.imul(r ^ r >>> 7, 61 | r)
    return ((r ^ r >>> 14) >>> 0) / 4294967296
  }
}
const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)]
const score = rnd => 1 + Math.floor(rnd() * 5)
const colors = ["蓝色", "红色", "紫色", "绿色", "金色", "白色", "黑色"]
const suggests = [
  "保持耐心，循序渐进。",
  "主动沟通，争取机会。",
  "专注当下，避免分心。",
  "适度休息，调节节奏。",
  "勇于尝试，拥抱变化。",
  "理性消费，按计划执行。",
  "善待自己，提升自信。"
]
const summarys = [
  "整体顺畅，适合推进计划。",
  "人际和谐，合作更易成功。",
  "灵感涌现，创意值得实践。",
  "稳中求进，细节决定成败。",
  "能量充沛，效率明显提升。"
]
app.get("/api/horoscope", (req, res) => {
  const date = String(req.query.date || "").trim()
  const constellation = String(req.query.constellation || "").trim()
  if (!date || !constellation) return res.status(400).json({ error: "missing params" })
  const key = `${date}-${constellation}`
  const cached = getCache(`basic:${key}`)
  if (cached && !USE_LLM) return res.json(cached)
  const rnd = rng(hash(key))
  const base = {
    overall: score(rnd),
    love: score(rnd),
    career: score(rnd),
    wealth: score(rnd),
    health: score(rnd),
    study: score(rnd),
    social: score(rnd),
    luckyColor: pick(rnd, colors),
    luckyNumber: 1 + Math.floor(rnd() * 9),
    suggestion: pick(rnd, suggests),
    summary: pick(rnd, summarys)
  }
  if (!USE_LLM) { setCache(`basic:${key}`, base); res.set('x-source','local'); return res.json(base) }
  const prompt = buildPrompt({ date, constellation, seed: key })
  generateHoroscope({ provider: LLM_PROVIDER, baseURL: LLM_BASE_URL, apiKey: LLM_API_KEY, model: LLM_MODEL, prompt, timeoutMs: LLM_TIMEOUT })
    .then(data => {
      const result = {
        ...base,
        ...(data || {})
      }
      setCache(`basic:${key}`, result)
      res.set('x-source','llm')
      res.json(result)
    })
    .catch((e) => {
      console.error('llm_error_basic', String(e && e.message || e))
      res.set('x-source','local_fallback')
      res.json(base)
    })
})
app.get('/api/horoscope/rich', (req, res) => {
  const date = String(req.query.date || '').trim()
  const constellation = String(req.query.constellation || '').trim()
  if (!date || !constellation) return res.status(400).json({ error: 'missing params' })
  const key = `${date}-${constellation}`
  const cached = getCache(`rich:${key}`)
  if (cached) return res.json(cached)
  const prompt = buildPrompt({ date, constellation, seed: key })
  generateHoroscope({ provider: LLM_PROVIDER, baseURL: LLM_BASE_URL, apiKey: LLM_API_KEY, model: LLM_MODEL, prompt, timeoutMs: LLM_TIMEOUT })
    .then(data => {
      const rnd = rng(hash(key))
      const base = {
        overall: score(rnd),
        love: score(rnd),
        career: score(rnd),
        wealth: score(rnd),
        health: score(rnd),
        study: score(rnd),
        social: score(rnd),
        luckyColor: pick(rnd, colors),
        luckyNumber: 1 + Math.floor(rnd() * 9)
      }
      const result = {
        ...base,
        title: data?.title || '',
        matchConstellation: data?.matchConstellation || '',
        healthIndex: data?.healthIndex || undefined,
        negotiationIndex: data?.negotiationIndex || undefined,
        sections: data?.sections || {
          overall: '', love: '', career: '', wealth: '', health: ''
        },
        source: 'llm'
      }
      setCache(`rich:${key}`, result)
      res.set('x-source','llm')
      res.json(result)
    })
    .catch((e) => {
      console.error('llm_error_rich', String(e && e.message || e))
      const rnd = rng(hash(key))
      const resLite = {
        overall: score(rnd), love: score(rnd), career: score(rnd), wealth: score(rnd), health: score(rnd), study: score(rnd), social: score(rnd),
        luckyColor: pick(rnd, colors), luckyNumber: 1 + Math.floor(rnd() * 9),
        title: '今日运势',
        sections: { overall: '保持耐心，循序渐进。', love: '主动沟通，争取机会。', career: '专注当下，避免分心。', wealth: '理性消费，按计划执行。', health: '适度休息，调节节奏。' },
        source: 'local_fallback'
      }
      res.set('x-source','local_fallback')
      res.json(resLite)
    })
})
const port = process.env.PORT || 3000
const host = process.env.HOST || "0.0.0.0"
app.listen(port, host, () => {
  console.log(`Server http://${host}:${port}`)
})
