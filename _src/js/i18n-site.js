/* global window, document, navigator, localStorage, NodeFilter */
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
      'ui.primaryNavigation': 'Primary',
      'ui.siteBrand': 'Open Budget: Sacramento',
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
      'links.cityFinanceDepartment': 'City of Sacramento Department of Finance',
      'links.cityBudget': 'City of Sacramento Budget',
      'links.recentBudgetData': 'Recent Sacramento Budget Data',
      'footer.aboutProjectHtml': 'Open Budget: Sacramento is an open-source project by <a href="https://opensac.org/">Open Sacramento</a> that seeks to help residents understand Sacramento\'s spending and budget process better. This application is a clone of <a href="https://openbudgetoakland.org/">Open Budget Oakland</a>, from <a href="https://openoakland.org/">OpenOakland</a>.',
      'social.x': 'Code for Sacramento on X (formerly Twitter)',
      'social.xAlt': 'X (formerly Twitter)',
      'social.github': 'Code for Sacramento on GitHub',
      'social.githubAlt': 'GitHub',
      'common.comments': 'Comments',
      'common.dataSource': 'Data source:',
      'common.pleaseEnableJs': 'Please enable JavaScript to view the',
      'flow.fiscalYear': 'Fiscal Year',
      'flow.selectFiscalYear': 'Select fiscal year',
      'flow.revenues': 'Revenues',
      'flow.expenses': 'Expenses',
      'flow.loadingChartData': 'Loading chart data...',
      'flow.unableLoadChartData': 'Unable to load chart data for {{fy}}. Please try another fiscal year or refresh the page.',
      'flow.showingChartFor': 'Showing chart for {{fy}}.',
      'flow.intro1': "This diagram depicts the flow of money through Sacramento's budget: from revenue sources (on the left), to the General Fund or various non-discretionary funds (in the center), and finally to the various city departments' expenses (on the right).",
      'flow.intro2': 'Mouse over a flow line to highlight it; click on a bar to highlight all its flows.',
      'flow.labels.generalFund': 'General Fund',
      'flow.labels.generalFunds': 'General Funds',
      'flow.labels.nonDiscretionaryFunds': 'Non-discretionary funds',
      'flow.labels.taxes': 'Taxes',
      'flow.labels.chargesFeesServices': 'Charges, Fees, and Services',
      'flow.labels.miscRevenue': 'Miscellaneous Revenue',
      'flow.labels.intergovernmental': 'Intergovernmental',
      'flow.labels.contributionsFromOtherFunds': 'Contributions from Other Funds',
      'flow.labels.licensesPermits': 'Licenses and Permits',
      'flow.labels.finesForfeituresPenalties': 'Fines, Forfeitures, and  Penalties',
      'flow.labels.interestRentsConcessions': 'Interest, Rents, and Concessions',
      'flow.labels.police': 'Police',
      'flow.labels.utilities': 'Utilities',
      'flow.labels.citywideCommunitySupport': 'Citywide and Community Support',
      'flow.labels.generalServices': 'General Services',
      'flow.labels.fire': 'Fire',
      'flow.labels.debtService': 'Debt Service',
      'flow.labels.publicWorks': 'Public Works',
      'flow.labels.humanResources': 'Human Resources',
      'flow.labels.parksRecreation': 'Parks and Recreation',
      'flow.labels.communityDevelopment': 'Community Development',
      'flow.labels.conventionCulturalServices': 'Convention and Cultural Services',
      'flow.labels.finance': 'Finance',
      'flow.labels.informationTechnology': 'Information Technology',
      'flow.labels.cityAttorney': 'City Attorney',
      'flow.labels.mayorCouncil': 'Mayor/Council',
      'flow.labels.cityManager': 'City Manager',
      'flow.labels.cityTreasurer': 'City Treasurer',
      'flow.labels.economicDevelopment': 'Economic Development',
      'flow.labels.cityClerk': 'City Clerk',
      'flow.labels.nonAppropriated': 'Non-Appropriated',
      'tree.intro1': 'Select year and account (revenues or expenses). Click on a fund to see the departments that receive its funding. Click on that department to see its spending or revenue. This page only shows "adopted budgets"; that is, budgets passed by the City Council.',
      'tree.intro2Html': 'The <strong>General Fund</strong> — roughly 40% of Sacramento\'s total budget -- is decided by a <a href="https://www.capradio.org/articles/2023/04/24/how-does-the-sacramento-city-budget-work-heres-what-you-need-to-know/">budget process</a> that includes private and public meetings, surveys, and negotiations. The other 60% of the budget comes from taxes, ballot measures, grants, fees, and other sources.',
      'tree.clickArea': 'Click on an area to start exploring',
      'treemap.showMore': 'Show more',
      'treemap.unableLoadData': 'Unable to load data',
      'treemap.dropdown.year': 'Year',
      'treemap.dropdown.account': 'Account',
      'treemap.table.item': 'Item',
      'treemap.table.expense': 'Expense',
      'treemap.table.revenue': 'Revenue',
      'feedback.formTitle': 'Open Budget Sacramento Feedback Form',
      'feedback.loadingForm': 'Loading feedback form...',
      'compare.toolAriaLabel': 'Budget comparison tool',
      'old.alert.cannotDigDeeper': "Sorry, we can't dig deeper"
    },
    'es-419': {
      'ui.language': 'Idioma',
      'ui.english': 'Inglés (EE. UU.)',
      'ui.spanishLatam': 'Español (Latinoamérica)',
      'ui.toggleNavigation': 'Alternar navegación',
      'ui.skipToMain': 'Saltar al contenido principal',
      'ui.primaryNavigation': 'Principal',
      'ui.siteBrand': 'Presupuesto Abierto: Sacramento',
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
      'links.cityFinanceDepartment': 'Departamento de Finanzas de la Ciudad de Sacramento',
      'links.cityBudget': 'Presupuesto de la Ciudad de Sacramento',
      'links.recentBudgetData': 'Datos presupuestarios recientes de Sacramento',
      'footer.aboutProjectHtml': 'Presupuesto Abierto: Sacramento es un proyecto de código abierto de <a href="https://opensac.org/">Open Sacramento</a> que busca ayudar a las y los residentes a comprender mejor el gasto y el proceso presupuestario de Sacramento. Esta aplicación es un clon de <a href="https://openbudgetoakland.org/">Open Budget Oakland</a>, de <a href="https://openoakland.org/">OpenOakland</a>.',
      'social.x': 'Code for Sacramento en X (antes Twitter)',
      'social.xAlt': 'X (antes Twitter)',
      'social.github': 'Code for Sacramento en GitHub',
      'social.githubAlt': 'GitHub',
      'common.comments': 'Comentarios',
      'common.dataSource': 'Fuente de datos:',
      'common.pleaseEnableJs': 'Activa JavaScript para ver',
      'flow.fiscalYear': 'Año fiscal',
      'flow.selectFiscalYear': 'Selecciona el año fiscal',
      'flow.revenues': 'Ingresos',
      'flow.expenses': 'Gastos',
      'flow.loadingChartData': 'Cargando datos de la gráfica...',
      'flow.unableLoadChartData': 'No se pudieron cargar los datos de la gráfica para {{fy}}. Prueba otro año fiscal o recarga la página.',
      'flow.showingChartFor': 'Mostrando gráfica para {{fy}}.',
      'flow.intro1': 'Este diagrama muestra el flujo de dinero a través del presupuesto de Sacramento: desde las fuentes de ingresos (a la izquierda), hacia el Fondo General o varios fondos no discrecionales (en el centro), y finalmente hacia los gastos de los distintos departamentos de la ciudad (a la derecha).',
      'flow.intro2': 'Pasa el cursor sobre una línea de flujo para resaltarla; haz clic en una barra para resaltar todos sus flujos.',
      'flow.labels.generalFund': 'Fondo General',
      'flow.labels.generalFunds': 'Fondos generales',
      'flow.labels.nonDiscretionaryFunds': 'Fondos no discrecionales',
      'flow.labels.taxes': 'Impuestos',
      'flow.labels.chargesFeesServices': 'Cargos, tarifas y servicios',
      'flow.labels.miscRevenue': 'Ingresos misceláneos',
      'flow.labels.intergovernmental': 'Intergubernamental',
      'flow.labels.contributionsFromOtherFunds': 'Aportes de otros fondos',
      'flow.labels.licensesPermits': 'Licencias y permisos',
      'flow.labels.finesForfeituresPenalties': 'Multas, decomisos y sanciones',
      'flow.labels.interestRentsConcessions': 'Intereses, rentas y concesiones',
      'flow.labels.police': 'Policía',
      'flow.labels.utilities': 'Servicios públicos',
      'flow.labels.citywideCommunitySupport': 'Apoyo comunitario y de toda la ciudad',
      'flow.labels.generalServices': 'Servicios generales',
      'flow.labels.fire': 'Bomberos',
      'flow.labels.debtService': 'Servicio de la deuda',
      'flow.labels.publicWorks': 'Obras públicas',
      'flow.labels.humanResources': 'Recursos humanos',
      'flow.labels.parksRecreation': 'Parques y recreación',
      'flow.labels.communityDevelopment': 'Desarrollo comunitario',
      'flow.labels.conventionCulturalServices': 'Convenciones y servicios culturales',
      'flow.labels.finance': 'Finanzas',
      'flow.labels.informationTechnology': 'Tecnología de la información',
      'flow.labels.cityAttorney': 'Fiscalía municipal',
      'flow.labels.mayorCouncil': 'Alcaldía/Concejo',
      'flow.labels.cityManager': 'Gerencia municipal',
      'flow.labels.cityTreasurer': 'Tesorería municipal',
      'flow.labels.economicDevelopment': 'Desarrollo económico',
      'flow.labels.cityClerk': 'Secretaría municipal',
      'flow.labels.nonAppropriated': 'No asignado',
      'tree.intro1': 'Selecciona año y cuenta (ingresos o gastos). Haz clic en un fondo para ver los departamentos que reciben su financiamiento. Haz clic en ese departamento para ver su gasto o ingreso. Esta página solo muestra "presupuestos adoptados"; es decir, presupuestos aprobados por el Concejo Municipal.',
      'tree.intro2Html': 'El <strong>Fondo General</strong> — cerca del 40% del presupuesto total de Sacramento — se define mediante un <a href="https://www.capradio.org/articles/2023/04/24/how-does-the-sacramento-city-budget-work-heres-what-you-need-to-know/">proceso presupuestario</a> que incluye reuniones públicas y privadas, encuestas y negociaciones. El otro 60% del presupuesto proviene de impuestos, medidas electorales, subvenciones, tarifas y otras fuentes.',
      'tree.clickArea': 'Haz clic en un área para comenzar a explorar',
      'treemap.showMore': 'Mostrar más',
      'treemap.unableLoadData': 'No se pudieron cargar los datos',
      'treemap.dropdown.year': 'Año',
      'treemap.dropdown.account': 'Cuenta',
      'treemap.table.item': 'Elemento',
      'treemap.table.expense': 'Gasto',
      'treemap.table.revenue': 'Ingreso',
      'feedback.formTitle': 'Formulario de comentarios de Open Budget Sacramento',
      'feedback.loadingForm': 'Cargando formulario de comentarios...',
      'compare.toolAriaLabel': 'Herramienta de comparación presupuestaria',
      'old.alert.cannotDigDeeper': 'No podemos profundizar más.'
    }
  }

  const LEGACY_TEXT_MAP = {
    'es-419': {
      Home: 'Inicio',
      Overview: 'Resumen',
      Comparison: 'Comparación',
      Detail: 'Detalle',
      Discuss: 'Debate',
      'Page Not Found': 'Página no encontrada',
      "Oops! The page you asked for can't be found.": 'La página que solicitaste no se encontró.',
      'Detailed Budget Breakdown': 'Desglose presupuestario detallado',
      'Budget Comparison': 'Comparación presupuestaria',
      'Cash Flow': 'Flujo de caja',
      Feedback: 'Comentarios',
      'Contact Open Sacramento': 'Contactar a Open Sacramento',
      'What We Do': 'Qué hacemos',
      'Who We Are': 'Quiénes somos',
      'Tools and Projects': 'Herramientas y proyectos',
      'Open Budget: Sacramento News': 'Noticias de Open Budget: Sacramento',
      'Sacramento Budget Charts and Posters': 'Gráficas y materiales del presupuesto de Sacramento',
      'Focus on Measure Z': 'Enfoque en la Medida Z',
      'Sacramento Budget Basics': 'Conceptos básicos del presupuesto de Sacramento',
      'Select fiscal year': 'Selecciona el año fiscal',
      'How would you use Open Budget?': '¿Cómo usarías Open Budget?',
      'Feedback form notice:': 'Aviso del formulario de comentarios:',
      'If this embedded form fails to load, use the direct link below to submit your input.': 'Si este formulario incrustado no carga, usa el enlace directo de abajo para enviar tu información.',
      'Submit feedback with the form below, or open it directly in a new tab.': 'Envía comentarios con el formulario de abajo o ábrelo directamente en una pestaña nueva.',
      'Open feedback form': 'Abrir formulario de comentarios',
      'Please enable JavaScript to view the': 'Activa JavaScript para ver',
      'comments powered by Disqus.': 'comentarios de Disqus.',
      'Get in Touch with Open Sacramento': 'Ponte en contacto con Open Sacramento',
      'LinkTree:': 'LinkTree:',
      'Website:': 'Sitio web:',
      'Email:': 'Correo electrónico:',
      'Meetup:': 'Meetup:',
      'Twitter:': 'X:',
      'Bluesky:': 'Bluesky:',
      'Mastodon:': 'Mastodon:',
      'LinkedIn:': 'LinkedIn:',
      'Facebook:': 'Facebook:',
      'GitHub:': 'GitHub:',
      'Open Budget: Sacramento is the result of many contributors including coders, community advocates, and city officials.': 'Open Budget: Sacramento es el resultado de muchas personas colaboradoras, incluyendo programadores, defensoras comunitarias y funcionarios municipales.',
      "We're looking for ideas and help, so get in touch and stop by our": 'Buscamos ideas y ayuda, así que ponte en contacto y acompáñanos en nuestro',
      'bi-weekly virtual meetup': 'encuentro virtual quincenal',
      'the first and third Wednesdays of the month from 6:30–8:30pm as part of': 'el primer y tercer miércoles de cada mes de 6:30 a 8:30 p. m. como parte de',
      'Community Action Night (': 'Noche de Acción Comunitaria (',
      'contact us': 'contáctanos',
      'ahead of time so we are sure to be available).': 'con anticipación para asegurarnos de estar disponibles).',
      'Contributors:': 'Colaboradores:',
      'Current team:': 'Equipo actual:',
      'And the rest of the original': 'Y el resto del equipo original de',
      'Open Budget: Sacramento uses code originally created by OpenOakland. Thanks OpenOakland for all your hard work!': 'Open Budget: Sacramento usa código creado originalmente por OpenOakland. Gracias, OpenOakland, por todo su gran trabajo.',
      'Who they are': 'Quiénes son',
      'Sacramento deserves to know what is in the budget and how it is made.': 'Sacramento merece saber qué hay en el presupuesto y cómo se elabora.',
      "Open Budget: Sacramento takes current and past budget data published by the City of Sacramento and transforms them into accessible visualizations. Our aim is to enable community members to be able to examine their city's budget for themselves.": 'Open Budget: Sacramento toma datos presupuestarios actuales e históricos publicados por la Ciudad de Sacramento y los transforma en visualizaciones accesibles. Nuestro objetivo es que la comunidad pueda examinar por sí misma el presupuesto de su ciudad.',
      "We have a suite of data viewing tools to help you understand Sacramento's budget.": 'Contamos con un conjunto de herramientas de visualización de datos para ayudarte a comprender el presupuesto de Sacramento.',
      "Get a bird's eye view of the big picture for a single year: where money comes from, and where it goes.": 'Obtén una vista general para un solo año: de dónde viene el dinero y a dónde va.',
      'Put two budgets head-to-head. How much did the budget grow or shrink? How are cuts and increases distributed across spending categories? How did revenue sources change?': 'Compara dos presupuestos cara a cara. ¿Cuánto creció o disminuyó el presupuesto? ¿Cómo se distribuyen los recortes y aumentos entre categorías de gasto? ¿Cómo cambiaron las fuentes de ingreso?',
      'Drill down into detailed spending and revenue data for each department and fund for a single year.': 'Profundiza en datos detallados de gasto e ingreso por departamento y fondo para un solo año.',
      'Custom Queries (Fiscal Year 2018 Only)': 'Consultas personalizadas (solo año fiscal 2018)',
      "Explore the details of the City of Sacramento's adopted 2018 budget.": 'Explora los detalles del presupuesto adoptado 2018 de la Ciudad de Sacramento.',
      'Sacramento Budget Data in Chart Form': 'Datos del presupuesto de Sacramento en formato de gráficas',
      'Sacramento Budget Features': 'Funciones del presupuesto de Sacramento',
      'How Does Sacramento Fund Violence Prevention?': '¿Cómo financia Sacramento la prevención de la violencia?',
      'Summary of Measure Z Funding': 'Resumen del financiamiento de la Medida Z',
      'Analysis: Does the Measure Z Budget Reflect a Good Strategy for Violence Prevention?': 'Análisis: ¿Refleja el presupuesto de la Medida Z una buena estrategia de prevención de la violencia?',
      'Want to know more? Delve into these Measure Z resources compiled by Open Budget: Sacramento': '¿Quieres saber más? Revisa estos recursos sobre la Medida Z compilados por Open Budget: Sacramento.',
      News: 'Noticias',
      'How much has the U.S. government spent this year? (United States)': '¿Cuánto ha gastado el gobierno de EE. UU. este año? (Estados Unidos)',
      Cities: 'Ciudades',
      'Counties (United States Only)': 'Condados (solo Estados Unidos)',
      'States (United States Only)': 'Estados (solo Estados Unidos)',
      'International (Countries/Regions)': 'Internacional (países/regiones)',
      'Budget Visualization Resources': 'Recursos de visualización presupuestaria',
      'Budget Data Resources': 'Recursos de datos presupuestarios',
      'Budget Visualization Examples': 'Ejemplos de visualización presupuestaria',
      'Open Budget Sacramento Docs': 'Documentación de Open Budget Sacramento',
      'Adopted Budget Policy Book': 'Libro de política presupuestaria adoptada',
      'Legacy Datasets': 'Conjuntos de datos históricos',
      'Data transformation notes: Revenue rows are aggregated by the second "Account Type" column. Expense rows are aggregated by the "Department" column. Funds are aggregated by the "Funds - Description" column, and all values other than "1010 - General Fund: General Purpose" are grouped under the heading "Non-discretionary funds."': 'Notas de transformación de datos: las filas de ingresos se agregan por la segunda columna "Tipo de cuenta". Las filas de gastos se agregan por la columna "Departamento". Los fondos se agregan por la columna "Fondos - Descripción", y todos los valores distintos de "1010 - Fondo General: Propósito General" se agrupan bajo el encabezado "Fondos no discrecionales".',
      'Data was sourced from "Revenue Tables" and "Expenditure Tables" in': 'Los datos provienen de "Tablas de ingresos" y "Tablas de gastos" en',
      'Section E: Financial Summaries': 'Sección E: Resúmenes financieros',
      'Funds other than the General Purpose Fund are grouped under the heading "Non-discretionary funds."': 'Los fondos distintos del Fondo de Propósito General se agrupan bajo el encabezado "Fondos no discrecionales".',
      'Source data contains an apparent anomaly where itemized General Purpose Fund revenues for 2016-17 differ from expected total by $20K.': 'Los datos fuente contienen una aparente anomalía: los ingresos desglosados del Fondo de Propósito General para 2016-17 difieren del total esperado en 20 mil dólares.',
      'Data provided by City of Sacramento staff; publication on': 'Datos proporcionados por personal de la Ciudad de Sacramento; publicación en',
      'pending as of 8/23/16.': 'pendiente al 23/08/2016.',
      'pending as of 8/21/16.': 'pendiente al 21/08/2016.',
      'Sacramento Budget Explorer': 'Explorador del presupuesto de Sacramento',
      'Open Budget: Sacramento': 'Presupuesto Abierto: Sacramento',
      'Data source:': 'Fuente de datos:',
      'Data Source:': 'Fuente de datos:',
      'Fiscal Year': 'Año fiscal',
      Comments: 'Comentarios',
      'What and How': 'Qué y cómo',
      Visualizations: 'Visualizaciones',
      'Sacramento Budget 101': 'Presupuesto de Sacramento 101',
      'About the Project': 'Sobre el proyecto',
      'Get Involved': 'Participa',
      'Give Feedback': 'Enviar comentarios',
      'Contact Us': 'Contáctanos',
      About: 'Acerca de',
      Data: 'Datos',
      Resources: 'Recursos',
      'Click on an area to start exploring': 'Haz clic en un área para comenzar a explorar',
      'Detailed Breakdown:': 'Desglose detallado:',
      'Cash Flow:': 'Flujo de caja:'
    }
  }

  const LEGACY_ATTRIBUTE_MAP = {
    'es-419': {
      Primary: 'Principal',
      'Budget comparison tool': 'Herramienta de comparación presupuestaria',
      'Select fiscal year': 'Selecciona el año fiscal',
      'Open Budget Sacramento Feedback Form': 'Formulario de comentarios de Open Budget Sacramento',
      'City of Sacramento Department of Finance': 'Departamento de Finanzas de la Ciudad de Sacramento',
      'City of Sacramento Budget': 'Presupuesto de la Ciudad de Sacramento',
      'Recent Sacramento Budget Data': 'Datos presupuestarios recientes de Sacramento',
      'Code for Sacramento on X (formerly Twitter)': 'Code for Sacramento en X (antes Twitter)',
      'Code for Sacramento on GitHub': 'Code for Sacramento en GitHub',
      'X (formerly Twitter)': 'X (antes Twitter)',
      'Our flow chart shows where the money comes from and where it goes. Are the things you care about underfunded? Find out!': 'Nuestra gráfica de flujo muestra de dónde viene el dinero y a dónde va. ¿Lo que te importa está subfinanciado? Descúbrelo.',
      'The comparison tool lets you compare two Sacramento city budgets.': 'La herramienta de comparación te permite comparar dos presupuestos de la ciudad de Sacramento.',
      'Our drill-down tool lets you examine Sacramento city spending and revenue in detail.': 'Nuestra herramienta de exploración detallada te permite examinar en detalle gastos e ingresos de Sacramento.',
      'the tool used to explore the 2018 budget data': 'herramienta usada para explorar los datos del presupuesto 2018',
      "Does our city's budget reflect our commitment to violence prevention?": '¿Refleja el presupuesto de nuestra ciudad nuestro compromiso con la prevención de la violencia?',
      'Analysis of Measure Z strategy': 'Análisis de la estrategia de la Medida Z',
      'Infographic displaying the budget process': 'Infografía que muestra el proceso presupuestario',
      'Open Sacramento': 'Open Sacramento',
      GitHub: 'GitHub'
    }
  }

  const LEGACY_REPLACE_CACHE = {}

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

    root.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      el.setAttribute('alt', t(el.getAttribute('data-i18n-alt')))
    })

    applyLegacyLeafText(root)
  }

  /**
   * Gets get sorted replacement keys.
   *
   * @param {any} map Input value.
   * @returns {any} Function result.
   */
  function getSortedReplacementKeys (map) {
    const cacheKey = Object.keys(map).join('||')
    if (!Object.prototype.hasOwnProperty.call(LEGACY_REPLACE_CACHE, cacheKey)) {
      LEGACY_REPLACE_CACHE[cacheKey] = Object.keys(map).sort(function (a, b) {
        return b.length - a.length
      })
    }
    return LEGACY_REPLACE_CACHE[cacheKey]
  }

  /**
   * Sets apply fragment map.
   *
   * @param {any} value Input value.
   * @param {any} map Input value.
   * @returns {any} Function result.
   */
  function applyFragmentMap (value, map) {
    if (!value || typeof value !== 'string') {
      return value
    }
    let result = value
    const keys = getSortedReplacementKeys(map)
    for (let i = 0; i < keys.length; i++) {
      const source = keys[i]
      const target = map[source]
      if (result.indexOf(source) !== -1) {
        result = result.split(source).join(target)
      }
    }
    return result
  }

  /**
   * Sets apply legacy attribute translations.
   *
   * @param {any} root Input value.
   * @param {any} attributeMap Input value.
   * @returns {any} Function result.
   */
  function applyLegacyAttributeTranslations (root, attributeMap) {
    if (!attributeMap) {
      return
    }
    root.querySelectorAll('[title],[aria-label],[alt],[placeholder]').forEach(function (el) {
      ;['title', 'aria-label', 'alt', 'placeholder'].forEach(function (attrName) {
        if (!el.hasAttribute(attrName)) {
          return
        }
        const current = el.getAttribute(attrName)
        const translated = applyFragmentMap(current, attributeMap)
        if (translated !== current) {
          el.setAttribute(attrName, translated)
        }
      })
    })
  }

  /**
   * Sets apply legacy text node translations.
   *
   * @param {any} root Input value.
   * @param {any} textMap Input value.
   * @returns {any} Function result.
   */
  function applyLegacyTextNodeTranslations (root, textMap) {
    if (!textMap || typeof document === 'undefined') {
      return
    }
    const container = root.nodeType === 9
      ? (root.body || root.documentElement)
      : root
    if (!container) {
      return
    }

    const nodeFilter = typeof NodeFilter !== 'undefined' ? NodeFilter.SHOW_TEXT : 4
    const walker = document.createTreeWalker(container, nodeFilter, null, false)
    const blockedParents = {
      SCRIPT: true,
      STYLE: true,
      TEXTAREA: true
    }

    let node = walker.nextNode()
    while (node) {
      const parentTag = node.parentNode && node.parentNode.nodeName
      if (!blockedParents[parentTag]) {
        const raw = String(node.nodeValue || '')
        if (raw.trim()) {
          const translated = applyFragmentMap(raw, textMap)
          if (translated !== raw) {
            node.nodeValue = translated
          }
        }
      }
      node = walker.nextNode()
    }
  }

  /**
   * Sets apply legacy document title translations.
   *
   * @param {any} locale Input value.
   * @returns {any} Function result.
   */
  function applyLegacyDocumentTitleTranslations (locale) {
    if (typeof document === 'undefined') {
      return
    }
    const textMap = LEGACY_TEXT_MAP[locale]
    if (!textMap) {
      return
    }
    const currentTitle = String(document.title || '')
    const translated = applyFragmentMap(currentTitle, textMap)
    if (translated !== currentTitle) {
      document.title = translated
    }
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

    applyLegacyAttributeTranslations(root, LEGACY_ATTRIBUTE_MAP[locale])
    applyLegacyTextNodeTranslations(root, LEGACY_TEXT_MAP[locale])
    applyLegacyDocumentTitleTranslations(locale)
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
