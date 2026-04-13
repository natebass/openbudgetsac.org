describe('compare i18n', () => {
  beforeEach(() => {
    jest.resetModules()
    window.history.replaceState({}, '', '/compare')
    document.documentElement.lang = 'en-US'
  })

  test('uses es-419 from query parameter', () => {
    window.history.replaceState({}, '', '/compare?lang=es-419')

    jest.isolateModules(() => {
      const i18nModule = require('../i18n.js')

      expect(i18nModule.resolveLanguage()).toBe('es-419')
      expect(i18nModule.t('compare.title.compare')).toBe('Comparar')
    })
  })

  test('falls back to document language when query is missing', () => {
    document.documentElement.lang = 'es-MX'

    jest.isolateModules(() => {
      const i18nModule = require('../i18n.js')

      expect(i18nModule.resolveLanguage()).toBe('es-419')
      expect(i18nModule.t('compare.title.with')).toBe('con')
    })
  })
})
