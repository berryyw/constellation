function buildPrompt({ date, constellation, seed }) {
  const system = [
    '你是资深占星师。必须只返回严格的 JSON，且可被 JSON.parse 解析。不要任何额外文本。',
    'JSON Schema 如下：',
    '{',
    '  "title": string,',
    '  "matchConstellation": string,',
    '  "healthIndex": number,',
    '  "negotiationIndex": number,',
    '  "sections": {',
    '    "overall": string,',
    '    "love": string,',
    '    "career": string,',
    '    "wealth": string,',
    '    "health": string',
    '  }',
    '}',
    '要求：',
    '1) 各分栏 150-250 字，包含具体行动建议；',
    '2) title 风格如“左右逢源的节奏”；',
    '3) 不要留空字符串；',
    '4) 只输出 JSON，不输出解释或前后缀。'
  ].join('\n')
  const user = JSON.stringify({
    date,
    constellation,
    locale: 'zh-CN',
    style: '温暖积极、具体建议',
    seed: String(seed || '')
  })
  return {
    system,
    user
  }
}

module.exports = { buildPrompt }
