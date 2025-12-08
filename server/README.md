# Horoscope Server

## 启动

- 安装依赖：`npm install`
- 启动服务：`npm start`
- 环境变量：支持 `PORT`、`HOST`、`CORS_ORIGINS`（逗号分隔）
 - 大模型：`USE_LLM`、`LLM_PROVIDER`、`LLM_BASE_URL`、`LLM_MODEL`、`LLM_API_KEY`、`LLM_TIMEOUT`、`LLM_CACHE_TTL`、`RATE_LIMIT_PER_MIN`

## 接口

- `GET /api/horoscope?date=YYYY-MM-DD&constellation=白羊座`
- 返回字段：`overall`、`love`、`career`、`wealth`、`health`、`study`、`social`、`luckyColor`、`luckyNumber`、`suggestion`、`summary`

## 示例

- `curl "http://localhost:3000/api/horoscope?date=2025-12-05&constellation=白羊座"`
 - `curl "http://localhost:3000/api/horoscope/rich?date=2025-12-05&constellation=白羊座"`

### 行为说明
- `/api/horoscope`：默认返回基础数值；当 `USE_LLM=true` 时，会融合模型生成的文案与字段
- `/api/horoscope/rich`：返回包含分栏详细解读的富文本 JSON
- 缓存：同一 `date+constellation` 结果缓存 24h；可通过 `LLM_CACHE_TTL` 调整
- 速率：每 IP 每分钟默认 60 次，可通过 `RATE_LIMIT_PER_MIN` 调整
 - `PORT=8080 HOST=0.0.0.0 CORS_ORIGINS=https://express-cbc1-205413-6-1390581601.sh.run.tcloudbase.com/ npm start`
