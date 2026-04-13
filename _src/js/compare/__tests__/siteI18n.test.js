describe('site i18n runtime', () => {
  beforeEach(() => {
    jest.resetModules()
    document.documentElement.lang = 'en'
    document.body.innerHTML = ''
    window.history.replaceState({}, '', '/adopted-budget-flow')
    window.localStorage.clear()
  })

  test('normalizes locale inputs and resolves from query param', () => {
    window.history.replaceState({}, '', '/adopted-budget-flow?lang=es-MX')

    jest.isolateModules(() => {
      const siteI18n = require('../../i18n-site.js')

      expect(siteI18n.normalizeLocale('es')).toBe('es-419')
      expect(siteI18n.normalizeLocale('en-GB')).toBe('en-US')
      expect(siteI18n.resolveLocale()).toBe('es-419')
    })
  })

  test('translates keyed elements and propagates locale to internal links', () => {
    document.body.innerHTML = `
      <label data-i18n="ui.language">Language</label>
      <a id="internal" href="/who-we-are">Who We Are</a>
      <a id="external" href="https://example.com/docs">Docs</a>
      <select data-locale-selector>
        <option value="en-US">English (US)</option>
        <option value="es-419">Español (Latinoamérica)</option>
      </select>
    `

    jest.isolateModules(() => {
      const siteI18n = require('../../i18n-site.js')
      siteI18n.setLocale('es-419')
    })

    expect(document.documentElement.lang).toBe('es-419')
    expect(document.querySelector('label').textContent).toBe('Idioma')
    expect(document.getElementById('internal').getAttribute('href')).toBe('/who-we-are?lang=es-419')
    expect(document.getElementById('external').getAttribute('href')).toBe('https://example.com/docs')
    expect(window.localStorage.getItem('ob.locale')).toBe('es-419')
  })
})
