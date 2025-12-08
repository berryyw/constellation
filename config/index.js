// const dev = { API_BASE_URL: "http://localhost:3000" }
const dev = {API_BASE_URL: "https://express-cbc1-205413-6-1390581601.sh.run.tcloudbase.com/"}
const prod = { API_BASE_URL: "https://express-cbc1-205413-6-1390581601.sh.run.tcloudbase.com/" }
const env = (() => { try { return wx.getAccountInfoSync().miniProgram.envVersion } catch (e) { return "develop" } })()
const cfg = (env === "release" || env === "trial") ? prod : dev
module.exports = cfg
