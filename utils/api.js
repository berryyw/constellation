const CONFIG = require("../config/index")
const joinUrl = (base, path) => {
  const b = String(base || "").replace(/\/+$/, "")
  const p = String(path || "").replace(/^\/+/, "")
  return `${b}/${p}`
}
const req = (path, data) => new Promise((resolve, reject) => {
  wx.request({ url: joinUrl(CONFIG.API_BASE_URL, path), method: "GET", data, success: r => resolve(r.data), fail: reject })
})
const fetchHoroscope = (date, constellation) => req("/api/horoscope", { date, constellation })
module.exports = { fetchHoroscope }
