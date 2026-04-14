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

  test('translates legacy page copy fragments on text nodes', () => {
    document.body.innerHTML = `
      <h2>What we do</h2>
      <p>Now that you know our goals, <a href="/feedback">share your ideas here</a>.</p>
      <p>Help us <a href="http://www.discourse.org/">install</a>, an open-source discussion platform (<a href="https://github.com/discourse/discourse">source code</a>).</p>
    `

    jest.isolateModules(() => {
      const siteI18n = require('../../i18n-site.js')
      siteI18n.setLocale('es-419')
    })

    expect(document.body.textContent).toContain('Qué hacemos')
    expect(document.body.textContent).toContain('Ahora que ya conoces nuestros objetivos')
    expect(document.body.textContent).toContain('comparte tus ideas aquí')
    expect(document.body.textContent).toContain('Ayúdanos')
    expect(document.body.textContent).toContain('una plataforma de discusión de código abierto')
  })

  test('exposes legacy label translation helper for dynamic data labels', () => {
    jest.isolateModules(() => {
      const siteI18n = require('../../i18n-site.js')
      siteI18n.setLocale('es-419')
      expect(siteI18n.translateLegacyText('Parks & Recreation')).toBe('Parques y recreación')
      expect(siteI18n.translateLegacyText('Intergovernmental')).toBe('Intergubernamental')
    })
  })
})
