const express = require("express")
const cors = require("cors")
const app = express()
const origins = String(process.env.CORS_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean)
app.use(cors({ origin: (origin, cb) => {
  if (!origin) return cb(null, true)
  if (origins.length === 0) return cb(null, true)
  cb(null, origins.includes(origin))
} }))
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
  const rnd = rng(hash(`${date}-${constellation}`))
  const result = {
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
  res.json(result)
})
const port = process.env.PORT || 3000
const host = process.env.HOST || "0.0.0.0"
app.listen(port, host, () => {
  console.log(`Server http://${host}:${port}`)
})
