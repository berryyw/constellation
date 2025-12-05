# Horoscope Server

## 启动

- 安装依赖：`npm install`
- 启动服务：`npm start`
- 环境变量：支持 `PORT`、`HOST`、`CORS_ORIGINS`（逗号分隔）

## 接口

- `GET /api/horoscope?date=YYYY-MM-DD&constellation=白羊座`
- 返回字段：`overall`、`love`、`career`、`wealth`、`health`、`study`、`social`、`luckyColor`、`luckyNumber`、`suggestion`、`summary`

## 示例

- `curl "http://localhost:3000/api/horoscope?date=2025-12-05&constellation=白羊座"`
 - `PORT=8080 HOST=0.0.0.0 CORS_ORIGINS=https://your-domain.example.com npm start`
