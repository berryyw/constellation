本文件用于说明如何在本地或云端验证 LLM 接入：

1. 配置环境变量（参考 server/.env.example），设置 USE_LLM=true 并填入 LLM_*。
2. 启动服务后，执行：
   - curl "http://localhost:3000/api/horoscope/rich?date=2025-12-08&constellation=巨蟹座"
3. 若失败，确认速率限制与缓存设置，检查日志无密钥打印。
