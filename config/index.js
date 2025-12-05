const dev = { API_BASE_URL: "http://localhost:3000" }
const prod = { API_BASE_URL: "https://your-domain.example.com" }
const env = (() => { try { return wx.getAccountInfoSync().miniProgram.envVersion } catch (e) { return "develop" } })()
const cfg = env === "release" ? prod : dev
module.exports = cfg
