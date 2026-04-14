const SUPPORTED_LANGUAGES = ['en-US', 'es-419']
const FALLBACK_LANGUAGE = 'en-US'

const resources = {
  'en-US': {
    translation: {
      loading: {
        comparisonData: 'Loading comparison data...',
        totals: 'Loading totals...',
        breakdown: 'Loading breakdown...'
      },
      error: {
        noBudgetYears: 'No budget years available.',
        compareDataUnavailable: 'Unable to load comparison data right now. Please refresh the page or try again in a moment.',
        breakdownUnavailable: 'Unable to load this breakdown right now. Try selecting a different year pair or refreshing the page.'
      },
      mode: {
        lowBandwidth: 'Low-bandwidth mode is on to reduce data and battery use.'
      },
      compare: {
        title: {
          compare: 'Compare',
          with: 'with'
        },
        budgetYear: {
          first: 'First budget year',
          second: 'Second budget year',
          selectFirst: 'Select first budget year',
          selectSecond: 'Select second budget year'
        },
        showChangesAs: 'Show changes as:',
        changeType: {
          percentage: 'percentage',
          dollars: 'dollars'
        },
        totalChange: 'Total Change:',
        breakdowns: {
          title: 'Budget breakdowns',
          description: 'Get more detail on where money came from and how it was spent.',
          navLabel: 'Budget breakdown views',
          spendDept: 'Spending by Department',
          spendCat: 'Spending by Category',
          revDept: 'Revenue by Department',
          revCat: 'Revenue by Category'
        },
        chartAria: {
          total: 'Comparison chart of total budget amounts by selected fiscal years',
          trend: 'Bar chart showing budget amounts for each category across selected fiscal years',
          row: 'Comparison chart for {{item}}'
        }
      },
      diffTable: {
        caption: 'Budget item differences and sort controls',
        sortBy: 'sort by:',
        sortAmount: 'amount',
        sortName: 'name',
        budgetItem: 'Budget Item',
        difference: 'Difference',
        showAllRows: 'Show all rows'
      },
      trend: {
        amountInMillions: 'Amount (in millions)'
      },
      diff: {
        newlyAdded: 'Newly Added'
      },
      budgetType: {
        adopted: 'Adopted',
        adjusted: 'Adjusted',
        proposed: 'Proposed'
      }
    }
  },
  'es-419': {
    translation: {
      loading: {
        comparisonData: 'Cargando datos de comparación...',
        totals: 'Cargando totales...',
        breakdown: 'Cargando desglose...'
      },
      error: {
        noBudgetYears: 'No hay años presupuestarios disponibles.',
        compareDataUnavailable: 'No se pueden cargar los datos de comparación ahora. Actualiza la página o inténtalo de nuevo en un momento.',
        breakdownUnavailable: 'No se puede cargar este desglose ahora. Intenta seleccionar otro par de años o actualiza la página.'
      },
      mode: {
        lowBandwidth: 'El modo de bajo consumo de datos está activado para reducir el uso de datos y batería.'
      },
      compare: {
        title: {
          compare: 'Comparar',
          with: 'con'
        },
        budgetYear: {
          first: 'Primer año presupuestario',
          second: 'Segundo año presupuestario',
          selectFirst: 'Selecciona el primer año presupuestario',
          selectSecond: 'Selecciona el segundo año presupuestario'
        },
        showChangesAs: 'Mostrar cambios como:',
        changeType: {
          percentage: 'porcentaje',
          dollars: 'dólares'
        },
        totalChange: 'Cambio total:',
        breakdowns: {
          title: 'Desgloses del presupuesto',
          description: 'Obtén más detalle sobre de dónde vino el dinero y cómo se gastó.',
          navLabel: 'Vistas de desglose del presupuesto',
          spendDept: 'Gasto por departamento',
          spendCat: 'Gasto por categoría',
          revDept: 'Ingresos por departamento',
          revCat: 'Ingresos por categoría'
        },
        chartAria: {
          total: 'Gráfica de comparación de montos totales del presupuesto por años fiscales seleccionados',
          trend: 'Gráfica de barras que muestra montos del presupuesto por categoría en los años fiscales seleccionados',
          row: 'Gráfica de comparación para {{item}}'
        }
      },
      diffTable: {
        caption: 'Diferencias por partida presupuestaria y controles de orden',
        sortBy: 'ordenar por:',
        sortAmount: 'monto',
        sortName: 'nombre',
        budgetItem: 'Partida presupuestaria',
        difference: 'Diferencia',
        showAllRows: 'Mostrar todas las filas'
      },
      trend: {
        amountInMillions: 'Monto (en millones)'
      },
      diff: {
        newlyAdded: 'Recién agregado'
      },
      budgetType: {
        adopted: 'Aprobado',
        adjusted: 'Ajustado',
        proposed: 'Propuesto'
      }
    }
  }
}

/**
 * Normalizes supported language inputs to canonical locale identifiers.
 *
 * @param {unknown} value Candidate language input.
 * @returns {'en-US'|'es-419'|null} Normalized locale, or null when unsupported.
 */
function normalizeLanguage (value) {
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
  const exactMatch = SUPPORTED_LANGUAGES.find(lang => lang.toLowerCase() === normalized)
  return exactMatch || null
}

/**
 * Resolves the active language from URL, document, and browser preferences.
 *
 * @returns {'en-US'|'es-419'} Resolved language code.
 */
function resolveLanguage () {
  if (typeof window !== 'undefined' && window.location && typeof window.location.search === 'string') {
    const params = new URLSearchParams(window.location.search)
    const fromQuery = normalizeLanguage(params.get('lang'))
    if (fromQuery) {
      return fromQuery
    }
  }

  if (typeof document !== 'undefined' && document.documentElement) {
    const fromHtml = normalizeLanguage(document.documentElement.lang)
    if (fromHtml) {
      return fromHtml
    }
  }

  if (typeof navigator !== 'undefined') {
    const preferred = Array.isArray(navigator.languages) ? navigator.languages : []
    for (const language of preferred) {
      const normalized = normalizeLanguage(language)
      if (normalized) {
        return normalized
      }
    }
    const fromNavigator = normalizeLanguage(navigator.language)
    if (fromNavigator) {
      return fromNavigator
    }
  }

  return FALLBACK_LANGUAGE
}

let currentLanguage = resolveLanguage()

/**
 * Looks up a translation message by dot-delimited key path.
 *
 * @param {'en-US'|'es-419'} language Locale key.
 * @param {string} key Dot-delimited translation key.
 * @returns {string|null} Message text when found.
 */
function lookupMessage (language, key) {
  const keys = String(key).split('.')
  let cursor = resources[language] && resources[language].translation
  for (let i = 0; i < keys.length; i++) {
    if (!cursor || typeof cursor !== 'object') {
      return null
    }
    cursor = cursor[keys[i]]
  }
  return typeof cursor === 'string' ? cursor : null
}

/**
 * Replaces `{{token}}` placeholders with provided interpolation values.
 *
 * @param {string} template Localized message template.
 * @param {Record<string, unknown>} values Interpolation values.
 * @returns {string} Interpolated message.
 */
function interpolate (template, values) {
  if (!values || typeof values !== 'object') {
    return template
  }
  return String(template).replace(/\{\{(\w+)\}\}/g, function (_full, token) {
    return Object.prototype.hasOwnProperty.call(values, token)
      ? String(values[token])
      : ''
  })
}

/**
 * Sets the active language and updates the document language attribute.
 *
 * @param {string} language Requested language value.
 * @returns {'en-US'|'es-419'} Active language code.
 */
function setLanguage (language) {
  currentLanguage = normalizeLanguage(language) || FALLBACK_LANGUAGE
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = currentLanguage
  }
  return currentLanguage
}

/**
 * Gets the current active language.
 *
 * @returns {'en-US'|'es-419'} Active language code.
 */
function getLanguage () {
  return currentLanguage
}

/**
 * Translates a message key with optional token interpolation.
 *
 * @param {string} key Translation key.
 * @param {Record<string, unknown>} options Interpolation values.
 * @returns {string} Localized message text.
 */
function t (key, options) {
  const localized = lookupMessage(currentLanguage, key)
  const fallback = lookupMessage(FALLBACK_LANGUAGE, key)
  const message = localized || fallback || String(key)
  return interpolate(message, options)
}

setLanguage(currentLanguage)

const i18n = {
  resolveLanguage,
  t,
  changeLanguage: setLanguage
}

Object.defineProperty(i18n, 'language', {
  get: getLanguage
})

export default i18n

export { resolveLanguage, setLanguage, getLanguage, t }
