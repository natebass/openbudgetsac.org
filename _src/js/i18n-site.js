/* global window, document, navigator, localStorage */
(function (global) {
  const DEFAULT_LOCALE = 'en-US'
  const SUPPORTED_LOCALES = ['en-US', 'es-419']
  const STORAGE_KEY = 'ob.locale'

  const STRINGS = {
    'en-US': {
      'ui.language': 'Language',
      'ui.english': 'English (US)',
      'ui.spanishLatam': 'Español (Latinoamérica)',
      'ui.toggleNavigation': 'Toggle navigation',
      'ui.skipToMain': 'Skip to main content',
      'nav.about': 'About',
      'nav.data': 'Data',
      'nav.resources': 'Resources',
      'nav.whoWeAre': 'Who We Are',
      'nav.contactUs': 'Contact Us',
      'nav.toolsProjects': 'Tools and Projects',
      'nav.whatAndHow': 'What and How',
      'nav.news': 'News',
      'nav.visualizations': 'Visualizations',
      'nav.budget101': 'Sacramento Budget 101',
      'nav.feedback': 'Feedback',
      'nav.aboutProject': 'About the Project',
      'nav.getInvolved': 'Get Involved',
      'nav.giveFeedback': 'Give Feedback',
      'common.comments': 'Comments',
      'common.dataSource': 'Data source:',
      'common.pleaseEnableJs': 'Please enable JavaScript to view the',
      'flow.fiscalYear': 'Fiscal Year',
      'flow.revenues': 'Revenues',
      'flow.expenses': 'Expenses',
      'flow.loadingChartData': 'Loading chart data...',
      'flow.unableLoadChartData': 'Unable to load chart data for {{fy}}. Please try another fiscal year or refresh the page.',
      'flow.showingChartFor': 'Showing chart for {{fy}}.',
      'flow.intro1': "This diagram depicts the flow of money through Sacramento's budget: from revenue sources (on the left), to the General Fund or various non-discretionary funds (in the center), and finally to the various city departments' expenses (on the right).",
      'flow.intro2': 'Mouse over a flow line to highlight it; click on a bar to highlight all its flows.',
      'tree.intro1': 'Select year and account (revenues or expenses). Click on a fund to see the departments that receive its funding. Click on that department to see its spending or revenue. This page only shows "adopted budgets"; that is, budgets passed by the City Council.',
      'tree.intro2Html': 'The <strong>General Fund</strong> — roughly 40% of Sacramento\'s total budget -- is decided by a <a href="https://www.capradio.org/articles/2023/04/24/how-does-the-sacramento-city-budget-work-heres-what-you-need-to-know/">budget process</a> that includes private and public meetings, surveys, and negotiations. The other 60% of the budget comes from taxes, ballot measures, grants, fees, and other sources.',
      'tree.clickArea': 'Click on an area to start exploring',
      'treemap.showMore': 'Show more',
      'treemap.unableLoadData': 'Unable to load data',
      'treemap.dropdown.year': 'Year',
      'treemap.dropdown.account': 'Account',
      'old.alert.cannotDigDeeper': "Sorry, we can't dig deeper"
    },
    'es-419': {
      'ui.language': 'Idioma',
      'ui.english': 'Inglés (EE. UU.)',
      'ui.spanishLatam': 'Español (Latinoamérica)',
      'ui.toggleNavigation': 'Alternar navegación',
      'ui.skipToMain': 'Saltar al contenido principal',
      'nav.about': 'Acerca de',
      'nav.data': 'Datos',
      'nav.resources': 'Recursos',
      'nav.whoWeAre': 'Quiénes somos',
      'nav.contactUs': 'Contáctanos',
      'nav.toolsProjects': 'Herramientas y proyectos',
      'nav.whatAndHow': 'Qué y cómo',
      'nav.news': 'Noticias',
      'nav.visualizations': 'Visualizaciones',
      'nav.budget101': 'Presupuesto de Sacramento 101',
      'nav.feedback': 'Comentarios',
      'nav.aboutProject': 'Sobre el proyecto',
      'nav.getInvolved': 'Participa',
      'nav.giveFeedback': 'Enviar comentarios',
      'common.comments': 'Comentarios',
      'common.dataSource': 'Fuente de datos:',
      'common.pleaseEnableJs': 'Activa JavaScript para ver',
      'flow.fiscalYear': 'Año fiscal',
      'flow.revenues': 'Ingresos',
      'flow.expenses': 'Gastos',
      'flow.loadingChartData': 'Cargando datos de la gráfica...',
      'flow.unableLoadChartData': 'No se pudieron cargar los datos de la gráfica para {{fy}}. Prueba otro año fiscal o recarga la página.',
      'flow.showingChartFor': 'Mostrando gráfica para {{fy}}.',
      'flow.intro1': 'Este diagrama muestra el flujo de dinero a través del presupuesto de Sacramento: desde las fuentes de ingresos (a la izquierda), hacia el Fondo General o varios fondos no discrecionales (en el centro), y finalmente hacia los gastos de los distintos departamentos de la ciudad (a la derecha).',
      'flow.intro2': 'Pasa el cursor sobre una línea de flujo para resaltarla; haz clic en una barra para resaltar todos sus flujos.',
      'tree.intro1': 'Selecciona año y cuenta (ingresos o gastos). Haz clic en un fondo para ver los departamentos que reciben su financiamiento. Haz clic en ese departamento para ver su gasto o ingreso. Esta página solo muestra "presupuestos adoptados"; es decir, presupuestos aprobados por el Concejo Municipal.',
      'tree.intro2Html': 'El <strong>Fondo General</strong> — cerca del 40% del presupuesto total de Sacramento — se define mediante un <a href="https://www.capradio.org/articles/2023/04/24/how-does-the-sacramento-city-budget-work-heres-what-you-need-to-know/">proceso presupuestario</a> que incluye reuniones públicas y privadas, encuestas y negociaciones. El otro 60% del presupuesto proviene de impuestos, medidas electorales, subvenciones, tarifas y otras fuentes.',
      'tree.clickArea': 'Haz clic en un área para comenzar a explorar',
      'treemap.showMore': 'Mostrar más',
      'treemap.unableLoadData': 'No se pudieron cargar los datos',
      'treemap.dropdown.year': 'Año',
      'treemap.dropdown.account': 'Cuenta',
      'old.alert.cannotDigDeeper': 'No podemos profundizar más.'
    }
  }

    /**
   * Builds normalize locale.
   *
   * @param {any} value Input value.
   * @returns {any} Function result.
   */
function normalizeLocale (value) {
    if (!value || typeof value !== 'string') {
      return null
    }
    const normalized = value.trim().toLowerCase()
    if (normalized === 'es' || normalized.startsWith('es-')) {
      return 'es-419'
    }
    if (normalized === 'en' || normalized.startsWith('en-')) {
      return 'en-US'
    }
    return null
  }

    /**
   * Builds interpolate.
   *
   * @param {any} template Input value.
   * @param {any} vars Input value.
   * @returns {any} Function result.
   */
function interpolate (template, vars) {
    if (!template || !vars) {
      return template
    }
    return String(template).replace(/\{\{(\w+)\}\}/g, function (_full, key) {
      return Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : ''
    })
  }

    /**
   * Runs t.
   *
   * @param {any} key Input value.
   * @param {any} fallback Input value.
   * @param {any} vars Input value.
   * @returns {any} Function result.
   */
function t (key, fallback, vars) {
    const locale = api.currentLocale || DEFAULT_LOCALE
    const catalog = STRINGS[locale] || STRINGS[DEFAULT_LOCALE]
    const base = catalog[key] || STRINGS[DEFAULT_LOCALE][key] || fallback || key
    return interpolate(base, vars)
  }

    /**
   * Gets resolve locale.
   *
   * @returns {any} Function result.
   */
function resolveLocale () {
    if (typeof global.location !== 'undefined' && typeof global.location.search === 'string') {
      const params = new URLSearchParams(global.location.search)
      const fromQuery = normalizeLocale(params.get('lang'))
      if (fromQuery) {
        return fromQuery
      }
    }

    if (typeof localStorage !== 'undefined') {
      const fromStorage = normalizeLocale(localStorage.getItem(STORAGE_KEY))
      if (fromStorage) {
        return fromStorage
      }
    }

    if (typeof document !== 'undefined' && document.documentElement) {
      const fromHtml = normalizeLocale(document.documentElement.lang)
      if (fromHtml) {
        return fromHtml
      }
    }

    if (typeof navigator !== 'undefined') {
      const list = Array.isArray(navigator.languages) ? navigator.languages : []
      for (let i = 0; i < list.length; i++) {
        const normalized = normalizeLocale(list[i])
        if (normalized) {
          return normalized
        }
      }
      const fromNavigator = normalizeLocale(navigator.language)
      if (fromNavigator) {
        return fromNavigator
      }
    }

    return DEFAULT_LOCALE
  }

    /**
   * Sets apply translations.
   *
   * @param {any} root Input value.
   * @returns {any} Function result.
   */
function applyTranslations (root) {
    if (!root || !root.querySelectorAll) {
      return
    }

    root.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'))
    })

    root.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'))
    })

    root.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title')))
    })

    root.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria-label')))
    })

    applyLegacyLeafText(root)
  }

    /**
   * Sets apply legacy leaf text.
   *
   * @param {any} root Input value.
   * @returns {any} Function result.
   */
function applyLegacyLeafText (root) {
    const locale = api.currentLocale || DEFAULT_LOCALE
    if (locale === 'en-US') {
      return
    }

    const textMap = {
      'Data source:': 'Fuente de datos:',
      'Data Source:': 'Fuente de datos:',
      'Fiscal Year': 'Año fiscal',
      Comments: 'Comentarios',
      Feedback: 'Comentarios',
      'What and How': 'Qué y cómo',
      News: 'Noticias',
      Visualizations: 'Visualizaciones',
      'Sacramento Budget 101': 'Presupuesto de Sacramento 101',
      'Tools and Projects': 'Herramientas y proyectos',
      'About the Project': 'Sobre el proyecto',
      'Get Involved': 'Participa',
      'Give Feedback': 'Enviar comentarios',
      'Who We Are': 'Quiénes somos',
      'Contact Us': 'Contáctanos',
      About: 'Acerca de',
      Data: 'Datos',
      Resources: 'Recursos',
      'Click on an area to start exploring': 'Haz clic en un área para comenzar a explorar'
    }

    root.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,a,label,button,option,summary,span,th,td,caption').forEach(function (el) {
      if (el.childElementCount > 0) {
        return
      }
      const raw = String(el.textContent || '').trim().replace(/\s+/g, ' ')
      if (!raw) {
        return
      }
      if (Object.prototype.hasOwnProperty.call(textMap, raw)) {
        el.textContent = textMap[raw]
        return
      }
      if (raw.indexOf('Detailed Breakdown:') === 0) {
        el.textContent = raw.replace('Detailed Breakdown:', 'Desglose detallado:')
        return
      }
      if (raw.indexOf('Cash Flow:') === 0) {
        el.textContent = raw.replace('Cash Flow:', 'Flujo de caja:')
      }
    })
  }

    /**
   * Sets propagate locale to links.
   *
   * @param {any} locale Input value.
   * @param {any} root Input value.
   * @returns {any} Function result.
   */
function propagateLocaleToLinks (locale, root) {
    if (!root || !root.querySelectorAll || !global.location) {
      return
    }
    root.querySelectorAll('a[href]').forEach(function (anchor) {
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
        return
      }
      let url
      try {
        url = new URL(href, global.location.href)
      } catch (_error) {
        return
      }
      if (url.origin !== global.location.origin) {
        return
      }
      url.searchParams.set('lang', locale)
      anchor.setAttribute('href', url.pathname + url.search + url.hash)
    })
  }

    /**
   * Sets set locale.
   *
   * @param {any} locale Input value.
   * @param {any} options Input value.
   * @returns {any} Function result.
   */
function setLocale (locale, options) {
    const normalized = normalizeLocale(locale) || DEFAULT_LOCALE
    api.currentLocale = normalized
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = normalized
    }
    if (!options || options.persist !== false) {
      try {
        localStorage.setItem(STORAGE_KEY, normalized)
      } catch (_error) {}
    }
    if (typeof document !== 'undefined') {
      applyTranslations(document)
      propagateLocaleToLinks(normalized, document)
      document.querySelectorAll('[data-locale-selector]').forEach(function (select) {
        select.value = normalized
      })
    }
    if (global.history && global.location && typeof global.history.replaceState === 'function') {
      const next = new URL(global.location.href)
      next.searchParams.set('lang', normalized)
      global.history.replaceState({}, '', next.pathname + next.search + next.hash)
    }
  }

    /**
   * Runs init.
   *
   * @returns {any} Function result.
   */
function init () {
    const locale = resolveLocale()
    setLocale(locale)

    if (typeof document !== 'undefined') {
      document.querySelectorAll('[data-locale-selector]').forEach(function (select) {
        select.addEventListener('change', function (event) {
          setLocale(event.target.value)
        })
      })
    }
  }

  const api = {
    DEFAULT_LOCALE,
    SUPPORTED_LOCALES,
    STRINGS,
    currentLocale: DEFAULT_LOCALE,
    normalizeLocale,
    resolveLocale,
    t,
    applyTranslations,
    propagateLocaleToLinks,
    setLocale,
    init
  }

  global.obI18n = api

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init)
    } else {
      init()
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api
  }
})(typeof window !== 'undefined' ? window : globalThis)
