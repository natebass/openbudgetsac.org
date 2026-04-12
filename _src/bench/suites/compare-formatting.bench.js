module.exports = function registerCompareFormattingSuite (suite, context) {
  const { asDiff } = context.compareUtils

  let sink = 0

  suite.add('compare/asDiff dollars format', { baseline: true }, () => {
    const formatted = asDiff(1250000, false)
    sink ^= formatted.length

    if (sink === Number.MIN_SAFE_INTEGER) {
      throw new Error('Sink guard should never trigger')
    }
  })

  suite.add('compare/asDiff pct format', () => {
    const formatted = asDiff(0.125, true)
    sink ^= formatted.length

    if (sink === Number.MIN_SAFE_INTEGER) {
      throw new Error('Sink guard should never trigger')
    }
  })

  suite.add('compare/asDiff sentinel format', () => {
    const formatted = asDiff(Infinity, false)
    sink ^= formatted.length

    if (sink === Number.MIN_SAFE_INTEGER) {
      throw new Error('Sink guard should never trigger')
    }
  })
}
