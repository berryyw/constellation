const CONFIG = require("../config/index")
const joinUrl = (base, path) => {
  const b = String(base || "").replace(/\/+$/, "")
  const p = String(path || "").replace(/^\/+/, "")
  return `${b}/${p}`
}
const req = (path, data) => new Promise((resolve, reject) => {
  const header = {}
  if (CONFIG.WX_SERVICE) header["x-wx-service"] = CONFIG.WX_SERVICE
  if ( CONFIG.WX_ENV ) header["x-wx-env"] = CONFIG.WX_ENV
  wx.request({
    url: joinUrl(CONFIG.API_BASE_URL, path),
    method: "GET",
    data,
    header,
    success: r => {
      const sc = Number(r.statusCode || 0)
      if (sc >= 200 && sc < 300) return resolve(r.data)
      return reject({ statusCode: sc, data: r.data })
    },
    fail: err => reject(err)
  })
})
const fetchHoroscope = (date, constellation) => req("/api/horoscope", { date, constellation })
const fetchHoroscopeRich = (date, constellation) => req("/api/horoscope/rich", { date, constellation })
module.exports = { fetchHoroscope, fetchHoroscopeRich }
