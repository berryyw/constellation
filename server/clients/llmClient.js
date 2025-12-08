const fetch = global.fetch

const PROVIDERS = {
  "openai-compatible": async ({ baseURL, apiKey, model, messages, timeoutMs, maxTokens }) => {
    const ctrl = new AbortController()
    const to = setTimeout(() => ctrl.abort(), Math.max(1000, timeoutMs || 15000))
    try {
      const r = await fetch(`${baseURL.replace(/\/+$/, '')}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          response_format: { type: 'json_object' },
          stream: false,
          temperature: 0.7,
          max_tokens: Number(maxTokens || 1024)
        }),
        signal: ctrl.signal
      })
      clearTimeout(to)
      if (!r.ok) {
        const errText = await r.text()
        throw new Error(`llm_http_${r.status}:${errText.substring(0,200)}`)
      }
      const data = await r.json()
      const content = data?.choices?.[0]?.message?.content
      if (!content) throw new Error('llm_empty')
      try {
        return JSON.parse(content)
      } catch (e) {
        throw new Error('llm_parse_json')
      }
    } catch (e) {
      clearTimeout(to)
      throw e
    }
  }
}

async function generateHoroscope({ provider, baseURL, apiKey, model, prompt, timeoutMs, maxTokens }) {
  const p = PROVIDERS[provider || 'openai-compatible']
  if (!p) throw new Error('llm_provider_unsupported')
  const messages = [
    { role: 'system', content: prompt.system },
    { role: 'user', content: prompt.user }
  ]
  return p({ baseURL, apiKey, model, messages, timeoutMs, maxTokens })
}

module.exports = { generateHoroscope }
