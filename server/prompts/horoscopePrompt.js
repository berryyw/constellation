function buildPrompt({ date, constellation, seed }) {
  const system = [
    '你是资深占星师，用中文输出严谨的 JSON。',
    '必须只返回 JSON，不要任何多余文本。',
    '星级字段必须是 1-5 的整数。',
    '分栏解读每栏 150-250 字，包含具体行为建议。'
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
