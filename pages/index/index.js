const stars = n => "★★★★★".slice(0, n)
const todayStr = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${dd}`
}
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
const api = require("../../utils/api")
const toStars = v => typeof v === "string" ? v : stars(Number(v))
const toResult = p => ({
  overallStars: toStars(p.overall),
  loveStars: toStars(p.love),
  careerStars: toStars(p.career),
  wealthStars: toStars(p.wealth),
  healthStars: toStars(p.health),
  studyStars: toStars(p.study),
  socialStars: toStars(p.social),
  luckyColor: p.luckyColor,
  luckyNumber: String(p.luckyNumber),
  suggestion: p.suggestion,
  summary: p.summary
})
const computeLocal = (date, c) => {
  const s = `${date}-${c}`
  const rnd = rng(hash(s))
  const overall = score(rnd)
  const love = score(rnd)
  const career = score(rnd)
  const wealth = score(rnd)
  const health = score(rnd)
  const study = score(rnd)
  const social = score(rnd)
  const colors = ["蓝色", "红色", "紫色", "绿色", "金色", "白色", "黑色"]
  const nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
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
  return {
    overallStars: stars(overall),
    loveStars: stars(love),
    careerStars: stars(career),
    wealthStars: stars(wealth),
    healthStars: stars(health),
    studyStars: stars(study),
    socialStars: stars(social),
    luckyColor: pick(rnd, colors),
    luckyNumber: pick(rnd, nums),
    suggestion: pick(rnd, suggests),
    summary: pick(rnd, summarys)
  }
}
Page({
  data: {
    constellations: [
      "白羊座",
      "金牛座",
      "双子座",
      "巨蟹座",
      "狮子座",
      "处女座",
      "天秤座",
      "天蝎座",
      "射手座",
      "摩羯座",
      "水瓶座",
      "双鱼座"
    ],
    constellationIndex: 0,
    date: "",
    result: null
  },
  onLoad() {
    const stored = wx.getStorageSync("selection") || {}
    const d = stored.date || todayStr()
    const i = stored.constellationIndex || 0
    this.setData({ date: d, constellationIndex: i })
  },
  onConstellationChange(e) {
    const i = Number(e.detail.value)
    this.setData({ constellationIndex: i })
  },
  onDateChange(e) {
    this.setData({ date: e.detail.value })
  },
  onCompute() {
    const c = this.data.constellations[this.data.constellationIndex]
    wx.showLoading({ title: "加载中" })
    api.fetchHoroscope(this.data.date, c).then(p => {
      const res = toResult(p)
      this.setData({ result: res })
      wx.setStorageSync("selection", { date: this.data.date, constellationIndex: this.data.constellationIndex })
    }).catch(() => {
      const res = computeLocal(this.data.date, c)
      this.setData({ result: res })
      wx.setStorageSync("selection", { date: this.data.date, constellationIndex: this.data.constellationIndex })
    }).finally(() => {
      wx.hideLoading()
    })
  }
})
