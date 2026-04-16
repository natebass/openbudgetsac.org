/* global window, document, navigator, localStorage, NodeFilter */
(global => {
  const DEFAULT_LOCALE = 'en-US';
  const SUPPORTED_LOCALES = ['en-US', 'es-419'];
  const STORAGE_KEY = 'ob.locale';

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
      'footer.aboutProjectHtml':
        'Open Budget: Sacramento is an open-source project by <a href="https://opensac.org/">Open Sacramento</a> that seeks to help residents understand Sacramento\'s spending and budget process better. This application is a clone of <a href="https://openbudgetoakland.org/">Open Budget Oakland</a>, from <a href="https://openoakland.org/">OpenOakland</a>.',
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
      'flow.unableLoadChartData':
        'Unable to load chart data for {{fy}}. Please try another fiscal year or refresh the page.',
      'flow.showingChartFor': 'Showing chart for {{fy}}.',
      'flow.intro1':
        "This diagram depicts the flow of money through Sacramento's budget: from revenue sources (on the left), to the General Fund or various non-discretionary funds (in the center), and finally to the various city departments' expenses (on the right).",
      'flow.intro2':
        'Mouse over a flow line to highlight it; click on a bar to highlight all its flows.',
      'flow.labels.generalFund': 'General Fund',
      'flow.labels.generalFunds': 'General Funds',
      'flow.labels.nonDiscretionaryFunds': 'Non-discretionary funds',
      'flow.labels.taxes': 'Taxes',
      'flow.labels.chargesFeesServices': 'Charges, Fees, and Services',
      'flow.labels.miscRevenue': 'Miscellaneous Revenue',
      'flow.labels.intergovernmental': 'Intergovernmental',
      'flow.labels.contributionsFromOtherFunds':
        'Contributions from Other Funds',
      'flow.labels.licensesPermits': 'Licenses and Permits',
      'flow.labels.finesForfeituresPenalties':
        'Fines, Forfeitures, and  Penalties',
      'flow.labels.interestRentsConcessions':
        'Interest, Rents, and Concessions',
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
      'flow.labels.conventionCulturalServices':
        'Convention and Cultural Services',
      'flow.labels.finance': 'Finance',
      'flow.labels.informationTechnology': 'Information Technology',
      'flow.labels.cityAttorney': 'City Attorney',
      'flow.labels.mayorCouncil': 'Mayor/Council',
      'flow.labels.cityManager': 'City Manager',
      'flow.labels.cityTreasurer': 'City Treasurer',
      'flow.labels.economicDevelopment': 'Economic Development',
      'flow.labels.cityClerk': 'City Clerk',
      'flow.labels.nonAppropriated': 'Non-Appropriated',
      'tree.intro1':
        'Select year and account (revenues or expenses). Click on a fund to see the departments that receive its funding. Click on that department to see its spending or revenue. This page only shows "adopted budgets"; that is, budgets passed by the City Council.',
      'tree.intro2Html':
        'The <strong>General Fund</strong> — roughly 40% of Sacramento\'s total budget -- is decided by a <a href="https://www.capradio.org/articles/2023/04/24/how-does-the-sacramento-city-budget-work-heres-what-you-need-to-know/">budget process</a> that includes private and public meetings, surveys, and negotiations. The other 60% of the budget comes from taxes, ballot measures, grants, fees, and other sources.',
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
      'old.alert.cannotDigDeeper': "Sorry, we can't dig deeper",
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
      'links.cityFinanceDepartment':
        'Departamento de Finanzas de la Ciudad de Sacramento',
      'links.cityBudget': 'Presupuesto de la Ciudad de Sacramento',
      'links.recentBudgetData': 'Datos presupuestarios recientes de Sacramento',
      'footer.aboutProjectHtml':
        'Presupuesto Abierto: Sacramento es un proyecto de código abierto de <a href="https://opensac.org/">Open Sacramento</a> que busca ayudar a las y los residentes a comprender mejor el gasto y el proceso presupuestario de Sacramento. Esta aplicación es un clon de <a href="https://openbudgetoakland.org/">Open Budget Oakland</a>, de <a href="https://openoakland.org/">OpenOakland</a>.',
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
      'flow.unableLoadChartData':
        'No se pudieron cargar los datos de la gráfica para {{fy}}. Prueba otro año fiscal o recarga la página.',
      'flow.showingChartFor': 'Mostrando gráfica para {{fy}}.',
      'flow.intro1':
        'Este diagrama muestra el flujo de dinero a través del presupuesto de Sacramento: desde las fuentes de ingresos (a la izquierda), hacia el Fondo General o varios fondos no discrecionales (en el centro), y finalmente hacia los gastos de los distintos departamentos de la ciudad (a la derecha).',
      'flow.intro2':
        'Pasa el cursor sobre una línea de flujo para resaltarla; haz clic en una barra para resaltar todos sus flujos.',
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
      'flow.labels.citywideCommunitySupport':
        'Apoyo comunitario y de toda la ciudad',
      'flow.labels.generalServices': 'Servicios generales',
      'flow.labels.fire': 'Bomberos',
      'flow.labels.debtService': 'Servicio de la deuda',
      'flow.labels.publicWorks': 'Obras públicas',
      'flow.labels.humanResources': 'Recursos humanos',
      'flow.labels.parksRecreation': 'Parques y recreación',
      'flow.labels.communityDevelopment': 'Desarrollo comunitario',
      'flow.labels.conventionCulturalServices':
        'Convenciones y servicios culturales',
      'flow.labels.finance': 'Finanzas',
      'flow.labels.informationTechnology': 'Tecnología de la información',
      'flow.labels.cityAttorney': 'Fiscalía municipal',
      'flow.labels.mayorCouncil': 'Alcaldía/Concejo',
      'flow.labels.cityManager': 'Gerencia municipal',
      'flow.labels.cityTreasurer': 'Tesorería municipal',
      'flow.labels.economicDevelopment': 'Desarrollo económico',
      'flow.labels.cityClerk': 'Secretaría municipal',
      'flow.labels.nonAppropriated': 'No asignado',
      'tree.intro1':
        'Selecciona año y cuenta (ingresos o gastos). Haz clic en un fondo para ver los departamentos que reciben su financiamiento. Haz clic en ese departamento para ver su gasto o ingreso. Esta página solo muestra "presupuestos adoptados"; es decir, presupuestos aprobados por el Concejo Municipal.',
      'tree.intro2Html':
        'El <strong>Fondo General</strong> — cerca del 40% del presupuesto total de Sacramento — se define mediante un <a href="https://www.capradio.org/articles/2023/04/24/how-does-the-sacramento-city-budget-work-heres-what-you-need-to-know/">proceso presupuestario</a> que incluye reuniones públicas y privadas, encuestas y negociaciones. El otro 60% del presupuesto proviene de impuestos, medidas electorales, subvenciones, tarifas y otras fuentes.',
      'tree.clickArea': 'Haz clic en un área para comenzar a explorar',
      'treemap.showMore': 'Mostrar más',
      'treemap.unableLoadData': 'No se pudieron cargar los datos',
      'treemap.dropdown.year': 'Año',
      'treemap.dropdown.account': 'Cuenta',
      'treemap.table.item': 'Elemento',
      'treemap.table.expense': 'Gasto',
      'treemap.table.revenue': 'Ingreso',
      'feedback.formTitle':
        'Formulario de comentarios de Presupuesto Abierto Sacramento',
      'feedback.loadingForm': 'Cargando formulario de comentarios...',
      'compare.toolAriaLabel': 'Herramienta de comparación presupuestaria',
      'old.alert.cannotDigDeeper': 'No podemos profundizar más.',
    },
  };

  const LEGACY_TEXT_MAP = {
    'es-419': {
      Home: 'Inicio',
      Overview: 'Resumen',
      Comparison: 'Comparación',
      Detail: 'Detalle',
      Discuss: 'Debate',
      'Page Not Found': 'Página no encontrada',
      "Oops! The page you asked for can't be found.":
        'La página que solicitaste no se encontró.',
      'Detailed Budget Breakdown': 'Desglose presupuestario detallado',
      'Budget Comparison': 'Comparación presupuestaria',
      'Cash Flow': 'Flujo de caja',
      Feedback: 'Comentarios',
      'Contact Open Sacramento': 'Contactar a Open Sacramento',
      'What We Do': 'Qué hacemos',
      'Who We Are': 'Quiénes somos',
      'Tools and Projects': 'Herramientas y proyectos',
      'Open Budget: Sacramento News': 'Noticias de Open Budget: Sacramento',
      'Sacramento Budget Charts and Posters':
        'Gráficas y materiales del presupuesto de Sacramento',
      'Focus on Measure Z': 'Enfoque en la Medida Z',
      'Sacramento Budget Basics':
        'Conceptos básicos del presupuesto de Sacramento',
      'Select fiscal year': 'Selecciona el año fiscal',
      'How would you use Open Budget?': '¿Cómo usarías Presupuesto Abierto?',
      'Feedback form notice:': 'Aviso del formulario de comentarios:',
      'If this embedded form fails to load, use the direct link below to submit your input.':
        'Si este formulario incrustado no carga, usa el enlace directo de abajo para enviar tu información.',
      'Submit feedback with the form below, or open it directly in a new tab.':
        'Envía comentarios con el formulario de abajo o ábrelo directamente en una pestaña nueva.',
      'Open feedback form': 'Abrir formulario de comentarios',
      'Please enable JavaScript to view the': 'Activa JavaScript para ver',
      'comments powered by Disqus.': 'comentarios de Disqus.',
      'Get in Touch with Open Sacramento':
        'Ponte en contacto con Open Sacramento',
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
      'Open Budget: Sacramento is the result of many contributors including coders, community advocates, and city officials.':
        'Open Budget: Sacramento es el resultado de muchas personas colaboradoras, incluyendo programadores, defensoras comunitarias y funcionarios municipales.',
      "We're looking for ideas and help, so get in touch and stop by our":
        'Buscamos ideas y ayuda, así que ponte en contacto y acompáñanos en nuestro',
      'bi-weekly virtual meetup': 'encuentro virtual quincenal',
      'the first and third Wednesdays of the month from 6:30–8:30pm as part of':
        'el primer y tercer miércoles de cada mes de 6:30 a 8:30 p. m. como parte de',
      'Community Action Night (': 'Noche de Acción Comunitaria (',
      'contact us': 'contáctanos',
      'ahead of time so we are sure to be available).':
        'con anticipación para asegurarnos de estar disponibles).',
      'Contributors:': 'Colaboradores:',
      'Current team:': 'Equipo actual:',
      'And the rest of the original': 'Y el resto del equipo original de',
      'Open Budget: Sacramento uses code originally created by OpenOakland. Thanks OpenOakland for all your hard work!':
        'Open Budget: Sacramento usa código creado originalmente por OpenOakland. Gracias, OpenOakland, por todo su gran trabajo.',
      'Who they are': 'Quiénes son',
      'Sacramento deserves to know what is in the budget and how it is made.':
        'Sacramento merece saber qué hay en el presupuesto y cómo se elabora.',
      "Open Budget: Sacramento takes current and past budget data published by the City of Sacramento and transforms them into accessible visualizations. Our aim is to enable community members to be able to examine their city's budget for themselves.":
        'Open Budget: Sacramento toma datos presupuestarios actuales e históricos publicados por la Ciudad de Sacramento y los transforma en visualizaciones accesibles. Nuestro objetivo es que la comunidad pueda examinar por sí misma el presupuesto de su ciudad.',
      "We have a suite of data viewing tools to help you understand Sacramento's budget.":
        'Contamos con un conjunto de herramientas de visualización de datos para ayudarte a comprender el presupuesto de Sacramento.',
      "Get a bird's eye view of the big picture for a single year: where money comes from, and where it goes.":
        'Obtén una vista general para un solo año: de dónde viene el dinero y a dónde va.',
      'Put two budgets head-to-head. How much did the budget grow or shrink? How are cuts and increases distributed across spending categories? How did revenue sources change?':
        'Compara dos presupuestos cara a cara. ¿Cuánto creció o disminuyó el presupuesto? ¿Cómo se distribuyen los recortes y aumentos entre categorías de gasto? ¿Cómo cambiaron las fuentes de ingreso?',
      'Drill down into detailed spending and revenue data for each department and fund for a single year.':
        'Profundiza en datos detallados de gasto e ingreso por departamento y fondo para un solo año.',
      'Custom Queries (Fiscal Year 2018 Only)':
        'Consultas personalizadas (solo año fiscal 2018)',
      "Explore the details of the City of Sacramento's adopted 2018 budget.":
        'Explora los detalles del presupuesto adoptado 2018 de la Ciudad de Sacramento.',
      'Sacramento Budget Data in Chart Form':
        'Datos del presupuesto de Sacramento en formato de gráficas',
      'Sacramento Budget Features': 'Funciones del presupuesto de Sacramento',
      'How Does Sacramento Fund Violence Prevention?':
        '¿Cómo financia Sacramento la prevención de la violencia?',
      'Summary of Measure Z Funding':
        'Resumen del financiamiento de la Medida Z',
      'Analysis: Does the Measure Z Budget Reflect a Good Strategy for Violence Prevention?':
        'Análisis: ¿Refleja el presupuesto de la Medida Z una buena estrategia de prevención de la violencia?',
      'Want to know more? Delve into these Measure Z resources compiled by Open Budget: Sacramento':
        '¿Quieres saber más? Revisa estos recursos sobre la Medida Z compilados por Open Budget: Sacramento.',
      News: 'Noticias',
      'How much has the U.S. government spent this year? (United States)':
        '¿Cuánto ha gastado el gobierno de EE. UU. este año? (Estados Unidos)',
      Cities: 'Ciudades',
      'Counties (United States Only)': 'Condados (solo Estados Unidos)',
      'States (United States Only)': 'Estados (solo Estados Unidos)',
      'International (Countries/Regions)': 'Internacional (países/regiones)',
      'Budget Visualization Resources':
        'Recursos de visualización presupuestaria',
      'Budget Data Resources': 'Recursos de datos presupuestarios',
      'Budget Visualization Examples':
        'Ejemplos de visualización presupuestaria',
      'Open Budget Sacramento Docs': 'Documentación de Open Budget Sacramento',
      'Adopted Budget Policy Book': 'Libro de política presupuestaria adoptada',
      'Legacy Datasets': 'Conjuntos de datos históricos',
      'Data transformation notes: Revenue rows are aggregated by the second "Account Type" column. Expense rows are aggregated by the "Department" column. Funds are aggregated by the "Funds - Description" column, and all values other than "1010 - General Fund: General Purpose" are grouped under the heading "Non-discretionary funds."':
        'Notas de transformación de datos: las filas de ingresos se agregan por la segunda columna "Tipo de cuenta". Las filas de gastos se agregan por la columna "Departamento". Los fondos se agregan por la columna "Fondos - Descripción", y todos los valores distintos de "1010 - Fondo General: Propósito General" se agrupan bajo el encabezado "Fondos no discrecionales".',
      'Data was sourced from "Revenue Tables" and "Expenditure Tables" in':
        'Los datos provienen de "Tablas de ingresos" y "Tablas de gastos" en',
      'Section E: Financial Summaries': 'Sección E: Resúmenes financieros',
      'Funds other than the General Purpose Fund are grouped under the heading "Non-discretionary funds."':
        'Los fondos distintos del Fondo de Propósito General se agrupan bajo el encabezado "Fondos no discrecionales".',
      'Source data contains an apparent anomaly where itemized General Purpose Fund revenues for 2016-17 differ from expected total by $20K.':
        'Los datos fuente contienen una aparente anomalía: los ingresos desglosados del Fondo de Propósito General para 2016-17 difieren del total esperado en 20 mil dólares.',
      'Data provided by City of Sacramento staff; publication on':
        'Datos proporcionados por personal de la Ciudad de Sacramento; publicación en',
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
      'Click on an area to start exploring':
        'Haz clic en un área para comenzar a explorar',
      'What we do': 'Qué hacemos',
      'How we do it': 'Cómo lo hacemos',
      'We display city budget data in a helpful and clear format, explain how the budget is put together and voted on, and give people resources to follow up on what they have learned.':
        'Mostramos datos del presupuesto de la ciudad en un formato claro y útil, explicamos cómo se arma y vota el presupuesto, y ofrecemos recursos para que las personas profundicen en lo que aprendieron.',
      'Open Budget: Sacramento helps people learn more about the city budget, so they can talk about it with each other, with city council members, and with city staff.  We want people to know how their city works and how it could work better.':
        'Open Budget: Sacramento ayuda a que las personas conozcan mejor el presupuesto de la ciudad, para que puedan hablar sobre él entre sí, con miembros del concejo municipal y con personal de la ciudad. Queremos que la gente sepa cómo funciona su ciudad y cómo podría funcionar mejor.',
      'We talk to': 'Hablamos con',
      'local groups': 'grupos locales',
      'to learn what they want to know about the budget and how best to share that knowledge.':
        'para saber qué quieren conocer del presupuesto y cuál es la mejor forma de compartir ese conocimiento.',
      'Every two years, at the beginning of each budget cycle, we get this data from Sacramento Open Data':
        'Cada dos años, al inicio de cada ciclo presupuestario, obtenemos estos datos de Sacramento Open Data',
      'and present it in a simple, useful format to access timely, accurate budget data and present it in a simple, useful format.':
        'y los presentamos en un formato simple y útil para acceder a datos presupuestarios oportunos y precisos.',
      'For those who wish to do their own analysis or make their own charts, we offer':
        'Para quienes desean hacer su propio análisis o crear sus propias gráficas, ofrecemos',
      'For those who wish to do their own analysis or make their own charts, we offer , which is':
        'Para quienes desean hacer su propio análisis o crear sus propias gráficas, ofrecemos, que es',
      'a free, easy-to-use open-source tool':
        'una herramienta de código abierto gratuita y fácil de usar',
      'which is': 'que es',
      'Now that you know our goals,':
        'Ahora que ya conoces nuestros objetivos,',
      'share your ideas here': 'comparte tus ideas aquí',
      "Timeline of Sacramento's Budget Process":
        'Cronología del proceso presupuestario de Sacramento',
      'Here are resources that have helped or inspired our work so far. Soon, we will relaunch this page as a wiki so people can more easily contribute. For now,':
        'Estos son recursos que han ayudado o inspirado nuestro trabajo hasta ahora. Pronto volveremos a lanzar esta página como una wiki para facilitar contribuciones. Por ahora,',
      'send us links to other resources': 'envíanos enlaces a otros recursos',
      '. As you explore the list below and see how others are making budgets more accessible, feel free to':
        '. Mientras exploras la lista de abajo y ves cómo otras personas hacen los presupuestos más accesibles, puedes',
      'suggest features': 'sugerir funciones',
      "Soon, we'll relaunch this page as a wiki so people can more easily contribute. For now,":
        'Pronto volveremos a lanzar esta página como una wiki para facilitar contribuciones. Por ahora,',
      'send us links': 'envíanos enlaces',
      '2013 Budget Discussion': 'Discusión del presupuesto 2013',
      'Budget Process Transparency Ordinance':
        'Ordenanza de transparencia del proceso presupuestario',
      "CODEFORSACRAMENTO's City Budget 101 (in progress)":
        'Presupuesto de la ciudad 101 de CODEFORSACRAMENTO (en progreso)',
      'Budget Office': 'Oficina de Presupuesto',
      'Budget Process': 'Proceso presupuestario',
      'Budget Advisory Committee': 'Comité Asesor de Presupuesto',
      'Sacramento Budget Prioritization':
        'Priorización del presupuesto de Sacramento',
      ": How would you allocate the City's General Fund budget?":
        ': ¿Cómo asignarías el presupuesto del Fondo General de la ciudad?',
      'Cash Flow: 2017-19 Proposed Budget':
        'Flujo de caja: presupuesto propuesto 2017-19',
      'Detailed Breakdown: 2017-19 Proposed Budget':
        'Desglose detallado: presupuesto propuesto 2017-19',
      'Cash Flow: 2016-17 Adjusted Budget':
        'Flujo de caja: presupuesto ajustado 2016-17',
      'Detailed Breakdown: 2016-17 Adjusted Budget':
        'Desglose detallado: presupuesto ajustado 2016-17',
      'Cash Flow: 2015-17 Proposed Budget':
        'Flujo de caja: presupuesto propuesto 2015-17',
      'Detailed Breakdown: 2015-17 Proposed Budget':
        'Desglose detallado: presupuesto propuesto 2015-17',
      'Cash Flow: 2015-17 Adopted Budget':
        'Flujo de caja: presupuesto adoptado 2015-17',
      'Detailed Breakdown: 2015-17 Adopted Budget':
        'Desglose detallado: presupuesto adoptado 2015-17',
      'Cash Flow: 2014-15 Adjusted Budget':
        'Flujo de caja: presupuesto ajustado 2014-15',
      'Cash Flow: 2013-15 Adopted Budget':
        'Flujo de caja: presupuesto adoptado 2013-15',
      'Detailed Breakdown: 2013-15 Adopted Budget':
        'Desglose detallado: presupuesto adoptado 2013-15',
      '2011-13 Adopted Spending (Treemap)':
        'Gasto adoptado 2011-13 (mapa de árbol)',
      'Focus on Measure Z: How does Sacramento fund violence prevention?':
        'Enfoque en la Medida Z: ¿cómo financia Sacramento la prevención de la violencia?',
      'Help us': 'Ayúdanos',
      ', an open-source discussion platform (':
        ', una plataforma de discusión de código abierto (',
      "City of Sacramento's Fiscal Year 2019-2021 Budget":
        'Presupuesto del año fiscal 2019-2021 de la Ciudad de Sacramento',
      'The Fiscal Data Package': 'Paquete de Datos Fiscales',
      'Checkbook NYC (New York City, New York, United States)':
        'Checkbook NYC (Ciudad de Nueva York, Nueva York, Estados Unidos)',
      "City of Palo Alto's Financial Reporting Platform (Palo Alto, California, United States)":
        'Plataforma de Reportes Financieros de la Ciudad de Palo Alto (Palo Alto, California, Estados Unidos)',
      'HNL Open Data (Honolulu, Hawaii, United States)':
        'HNL Open Data (Honolulu, Hawái, Estados Unidos)',
      'Berlin Open Data (Berlin, Berlin, Germany)':
        'Berlin Open Data (Berlín, Berlín, Alemania)',
      'OpenDataPhilly (Philadelphia, Pennsylvania, United States)':
        'OpenDataPhilly (Filadelfia, Pensilvania, Estados Unidos)',
      'Long Beach Open Data Portal (Long Beach, California, United States)':
        'Portal de Datos Abiertos de Long Beach (Long Beach, California, Estados Unidos)',
      'Cook County Open Data (Cook County, Illinois, United States)':
        'Datos Abiertos del Condado de Cook (Condado de Cook, Illinois, Estados Unidos)',
      'Budget Challenge (California, United States)':
        'Desafío Presupuestario (California, Estados Unidos)',
      'Budget Browser (Massachusetts, United States)':
        'Navegador Presupuestario (Massachusetts, Estados Unidos)',
      'Our State Budget - (Washington, United States)':
        'Nuestro Presupuesto Estatal - (Washington, Estados Unidos)',
      'Where Does It All Go? (United Kingdom)':
        '¿A dónde va todo? (Reino Unido)',
      'Central Government Budget (Sweden)':
        'Presupuesto del Gobierno Central (Suecia)',
      'National Budget Investment (Cameroon)':
        'Inversión del Presupuesto Nacional (Camerún)',
      '"In Sacramento, Calif., CODEFORSACRAMENTO, a civic-tech innovation brigade from Code for America, has a conversation feature that lets users ask questions and discuss every line item of the city budget."':
        '"En Sacramento, California, CODEFORSACRAMENTO, una brigada de innovación cívico-tecnológica de Code for America, cuenta con una función de conversación que permite a las personas usuarias hacer preguntas y debatir cada partida del presupuesto municipal."',
      'GovTech: "Developed a visualization tool called Open Budget to allow the public to explore the city budget."':
        'GovTech: "Desarrolló una herramienta de visualización llamada Open Budget para que el público pueda explorar el presupuesto de la ciudad."',
      'KALW: "Volunteers hack technology to improve the Sacramento city government."':
        'KALW: "Personas voluntarias usan tecnología para mejorar el gobierno municipal de Sacramento."',
      'Sacramento Bee: "Hacking Sacramento\'s Budget."':
        'Sacramento Bee: "Hackeando el presupuesto de Sacramento."',
      'Sacramento Bee: "Our Town, Our Budget: What Does Public Safety Really Look Like?"':
        'Sacramento Bee: "Nuestra ciudad, nuestro presupuesto: ¿cómo es realmente la seguridad pública?"',
      'Tech President: "Sacramento Gets A New Data Visualization Site for Its Budget"':
        'Tech President: "Sacramento obtiene un nuevo sitio de visualización de datos para su presupuesto"',
      'Detailed Breakdown:': 'Desglose detallado:',
      'Cash Flow:': 'Flujo de caja:',
    },
  };

  const LEGACY_ATTRIBUTE_MAP = {
    'es-419': {
      Primary: 'Principal',
      'Budget comparison tool': 'Herramienta de comparación presupuestaria',
      'Select fiscal year': 'Selecciona el año fiscal',
      'Open Budget Sacramento Feedback Form':
        'Formulario de comentarios de Presupuesto Abierto Sacramento',
      'City of Sacramento Department of Finance':
        'Departamento de Finanzas de la Ciudad de Sacramento',
      'City of Sacramento Budget': 'Presupuesto de la Ciudad de Sacramento',
      'Recent Sacramento Budget Data':
        'Datos presupuestarios recientes de Sacramento',
      'Code for Sacramento on X (formerly Twitter)':
        'Code for Sacramento en X (antes Twitter)',
      'Code for Sacramento on GitHub': 'Code for Sacramento en GitHub',
      'X (formerly Twitter)': 'X (antes Twitter)',
      'Our flow chart shows where the money comes from and where it goes. Are the things you care about underfunded? Find out!':
        'Nuestra gráfica de flujo muestra de dónde viene el dinero y a dónde va. ¿Lo que te importa está subfinanciado? Descúbrelo.',
      'The comparison tool lets you compare two Sacramento city budgets.':
        'La herramienta de comparación te permite comparar dos presupuestos de la ciudad de Sacramento.',
      'Our drill-down tool lets you examine Sacramento city spending and revenue in detail.':
        'Nuestra herramienta de exploración detallada te permite examinar en detalle gastos e ingresos de Sacramento.',
      'the tool used to explore the 2018 budget data':
        'herramienta usada para explorar los datos del presupuesto 2018',
      "Does our city's budget reflect our commitment to violence prevention?":
        '¿Refleja el presupuesto de nuestra ciudad nuestro compromiso con la prevención de la violencia?',
      'Analysis of Measure Z strategy':
        'Análisis de la estrategia de la Medida Z',
      'Infographic displaying the budget process':
        'Infografía que muestra el proceso presupuestario',
      'Open Sacramento': 'Open Sacramento',
      GitHub: 'GitHub',
    },
  };

  const LEGACY_DATA_LABEL_MAP = {
    'es-419': {
      'City Attorney': 'Fiscalía municipal',
      'City Auditor': 'Auditoría municipal',
      'City Clerk': 'Secretaría municipal',
      'City Manager': 'Gerencia municipal',
      'City Treasurer': 'Tesorería municipal',
      'Citywide and Community Support': 'Apoyo comunitario y de toda la ciudad',
      'Community Development': 'Desarrollo comunitario',
      'Community Response': 'Respuesta comunitaria',
      'Convention & Cultural Services': 'Convenciones y servicios culturales',
      'Convention and Cultural Services': 'Convenciones y servicios culturales',
      'Debt Service': 'Servicio de la deuda',
      'Economic Development': 'Desarrollo económico',
      Finance: 'Finanzas',
      Fire: 'Bomberos',
      'General Services': 'Servicios generales',
      'Human Resources': 'Recursos humanos',
      'Information Technology': 'Tecnología de la información',
      'Mayor/Council': 'Alcaldía/Concejo',
      'Non Appropriated': 'No asignado',
      'Non-Appropriated': 'No asignado',
      'Office of the City Auditor': 'Oficina de la Auditoría Municipal',
      'Parks & Recreation': 'Parques y recreación',
      'Parks and Recreation': 'Parques y recreación',
      Police: 'Policía',
      Projects: 'Proyectos',
      'Public Works': 'Obras públicas',
      Technology: 'Tecnología',
      Utilities: 'Servicios públicos',
      'Youth, Parks, and Community Enrichment':
        'Juventud, parques y enriquecimiento comunitario',
      'Assessment Levies': 'Gravámenes de evaluación',
      'Books and Periodicals': 'Libros y publicaciones periódicas',
      'Capital Improvements': 'Mejoras de capital',
      'Charges, Fees, & Services Accounts':
        'Cuentas de cargos, tarifas y servicios',
      'Charges, Fees, and Services': 'Cargos, tarifas y servicios',
      'City Debt Service': 'Servicio de la deuda de la ciudad',
      'City Property': 'Propiedad de la ciudad',
      Contingency: 'Contingencia',
      'Contingency Accounts': 'Cuentas de contingencia',
      'Contributions from Other Funds': 'Aportes de otros fondos',
      'Contributions from Other Funds Accounts':
        'Cuentas de aportes de otros fondos',
      'Debt Service Accounts': 'Cuentas de servicio de la deuda',
      Donations: 'Donaciones',
      Earnings: 'Ingresos',
      'Employee Benefits': 'Beneficios para empleados',
      'Employee Services': 'Servicios al personal',
      'Employer Paid Taxes': 'Impuestos pagados por el empleador',
      'Energy and Fuel': 'Energía y combustible',
      'Fines Forfeitures Penalties': 'Multas, decomisos y sanciones',
      'Fines, Forfeitures, &  Penalties': 'Multas, decomisos y sanciones',
      'Fines, Forfeitures, and  Penalties': 'Multas, decomisos y sanciones',
      Food: 'Alimentos',
      'General Supplies': 'Suministros generales',
      'Interest, Rents, & Concessions': 'Intereses, rentas y concesiones',
      'Interest, Rents, Concessions': 'Intereses, rentas y concesiones',
      'Interest, Rents, and Concessions': 'Intereses, rentas y concesiones',
      'Interfund Reimbursement': 'Reembolso entre fondos',
      'Interfund SerProvided': 'Servicios provistos entre fondos',
      Intergovernmental: 'Intergubernamental',
      'Intergovernmental Accounts': 'Cuentas intergubernamentales',
      'Inventory Supplies': 'Suministros de inventario',
      'Labor Adjustments': 'Ajustes laborales',
      'Labor and Supply Offset': 'Compensación laboral y de suministros',
      'Labor/Supply Offset': 'Compensación laboral/suministros',
      'Licenses  Permits': 'Licencias y permisos',
      'Licenses & Permits': 'Licencias y permisos',
      'Licenses and Permits': 'Licencias y permisos',
      'Miscellaneous Revenue': 'Ingresos misceláneos',
      'Miscellaneous Revenue Accounts': 'Cuentas de ingresos misceláneos',
      'Multi-Year Operating Projects': 'Proyectos operativos multianuales',
      'Multi-Year Operating Projects ': 'Proyectos operativos multianuales',
      'Operating Transfers': 'Transferencias operativas',
      'Operating Transfers Accounts': 'Cuentas de transferencias operativas',
      'Other Objects': 'Otros conceptos',
      'Other Purchased Services': 'Otros servicios contratados',
      'Other Services and Supplies': 'Otros servicios y suministros',
      'Other Sources (Uses)': 'Otras fuentes (usos)',
      'Other Tax': 'Otros impuestos',
      'Other Taxes': 'Otros impuestos',
      Property: 'Propiedad',
      'Property Accounts': 'Cuentas de propiedad',
      'Property Tax': 'Impuesto a la propiedad',
      'Property Taxes': 'Impuestos a la propiedad',
      'Purchased Prof and Tech Svcs':
        'Servicios profesionales y técnicos contratados',
      'Purchased Property Services': 'Servicios de propiedad contratados',
      Salaries: 'Salarios',
      'Sales Tax': 'Impuesto sobre ventas',
      'Service & Supply Adjustments': 'Ajustes de servicios y suministros',
      Taxes: 'Impuestos',
      Transfers: 'Transferencias',
      'Utility User Tax': 'Impuesto a usuarios de servicios públicos',
      Revenue: 'Ingresos',
      Expense: 'Gasto',
      Expenses: 'Gastos',
      Fund: 'Fondo',
      Funds: 'Fondos',
      ' and ': ' y ',
      ' & ': ' y ',
      ' - ': ' - ',
      Maintenance: 'Mantenimiento',
      Maint: 'Mantenimiento',
      Benefit: 'Beneficio',
      Area: 'Área',
      Street: 'Calle',
      Program: 'Programa',
      Reinvestment: 'Reinversión',
      Registration: 'Registro',
      Housing: 'Vivienda',
      Office: 'Oficina',
      Planning: 'Planificación',
      Cultural: 'Cultural',
      Services: 'Servicios',
      Other: 'Otro',
      District: 'Distrito',
      Dist: 'Distrito',
      Mgmt: 'Gestión',
      Management: 'Gestión',
      Loan: 'Préstamo',
      Trust: 'Fideicomiso',
      Contributions: 'Aportes',
      Capital: 'Capital',
      Grant: 'Subvención',
      Grants: 'Subvenciones',
      Fleet: 'Flota',
      Tax: 'Impuesto',
      Construction: 'Construcción',
      Acquisition: 'Adquisición',
      Lighting: 'Iluminación',
      Landscaping: 'Paisajismo',
      Parcel: 'Parcelario',
      Fee: 'Tarifa',
      Development: 'Desarrollo',
      Safety: 'Seguridad',
      Transportation: 'Transporte',
      Replacement: 'Reemplazo',
      Recycling: 'Reciclaje',
      Waste: 'Residuos',
      Water: 'Agua',
      Wastewater: 'Aguas residuales',
      Bonds: 'Bonos',
      Bond: 'Bono',
      Refunding: 'Refinanciamiento',
      Ref: 'Ref.',
      Ser: 'Serie',
      Series: 'Serie',
      Lease: 'Arrendamiento',
      Financing: 'Financiamiento',
      Northside: 'Lado norte',
      Neighborhood: 'Barrio',
      Community: 'Comunidad',
      Tree: 'Árbol',
      Planting: 'Plantación',
      Route: 'Ruta',
      State: 'Estatal',
      Sports: 'Deportes',
      Commission: 'Comisión',
      Tourism: 'Turismo',
      Market: 'Mercado',
      Parking: 'Estacionamiento',
      Marina: 'Marina',
      Start: 'Inicio',
      Zoo: 'Zoológico',
      '15_CIRBS': '15_CIRBS',
      '16th St PBID': 'PBID de la calle 16',
      '2003 North Sac TE TABS': 'TABS TE de North Sac 2003',
      'Aggie Square EIFD': 'EIFD de Aggie Square',
      'Central Midtown Restaurant BID':
        'BID de restaurantes de Central Midtown',
      'Curtis Park CFD 2013-03': 'CFD Curtis Park 2013-03',
      'Curtis Park Village CFD 2014-02': 'CFD Curtis Park Village 2014-02',
      'Del Paso Bid': 'BID de Del Paso',
      'Del Paso PBID': 'PBID de Del Paso',
      'Downtown Plaza Bid': 'BID de Downtown Plaza',
      'Downtown Plaza PBID': 'PBID de Downtown Plaza',
      'Fairytale Town': 'Ciudad de Cuento',
      'Franklin Blvd Bid': 'BID de Franklin Blvd',
      'Franklin Blvd PBID': 'PBID de Franklin Blvd',
      'Franklin Boulevard PBID': 'PBID de Franklin Boulevard',
      'Franklin Boulevard Pbid': 'PBID de Franklin Boulevard',
      'Greater Broadway PBID': 'PBID de Greater Broadway',
      'Handle BID No 2011-04': 'BID Handle Núm. 2011-04',
      'Jacinto Creek': 'Arroyo Jacinto',
      'Land Park': 'Parque Land',
      'Mack Road PBID': 'PBID de Mack Road',
      'Measure U': 'Medida U',
      'Midtown Sacramento PBID': 'PBID de Midtown Sacramento',
      'N Nat Lndscp 99-02': 'Paisajismo N Nat 99-02',
      'N Natomas Lands CFD 3': 'CFD 3 de tierras de N Natomas',
      'N Natomas Lands Cfd 3': 'CFD 3 de tierras de N Natomas',
      'NN Westlake CFD 2000-01 Const': 'CFD NN Westlake 2000-01 Const.',
      'NW Land Park CFD 2013-02': 'CFD NW Land Park 2013-02',
      'Natomas Central CFD 2006-02': 'CFD Natomas Central 2006-02',
      'Natomas Crossing CFD 2013-01': 'CFD Natomas Crossing 2013-01',
      'New Measure A Specific Project':
        'Proyecto específico de la Nueva Medida A',
      'Oak Park PBID': 'PBID de Oak Park',
      'Old Sacramento Bid': 'BID de Old Sacramento',
      'Old Sacramento PBID': 'PBID de Old Sacramento',
      'Parkebridge CFD 2014-07': 'CFD Parkebridge 2014-07',
      'Power Inn Rd Md 2003-01':
        'Distrito de mantenimiento Power Inn Rd 2003-01',
      'Quimby Act': 'Ley Quimby',
      'SHRA CDBG': 'SHRA CDBG',
      'Sacramento TID': 'TID de Sacramento',
      'So Natomas Comm Improv': 'Mejoras comunitarias de So Natomas',
      'Special Recreation': 'Recreación especial',
      'Stockton Blvd BIA': 'BIA de Stockton Blvd',
      'Stockton Blvd PBID': 'PBID de Stockton Blvd',
      'Stockton Blvd Pbid': 'PBID de Stockton Blvd',
      'Storm Drainage': 'Drenaje pluvial',
      'Township 9 CFD No. 2012-06': 'CFD Township 9 Núm. 2012-06',
      'Willowcreek Assmnt Md': 'Distrito de evaluación Willowcreek',
      'Willowcreek Lndscpng CFD': 'CFD de paisajismo Willowcreek',
      'Willowcreek Lndscpng Cfd': 'CFD de paisajismo Willowcreek',
    },
  };

  const LEGACY_REPLACE_CACHE = {};

  /**
   * Normalizes locale values to supported site locales.
   *
   * @param {unknown} value Candidate locale input.
   * @returns {'en-US'|'es-419'|null} Supported locale code or null.
   */
  function normalizeLocale(value) {
    if (!value || typeof value !== 'string') {
      return null;
    }
    const normalized = value.trim().toLowerCase();
    if (normalized === 'es' || normalized.startsWith('es-')) {
      return 'es-419';
    }
    if (normalized === 'en' || normalized.startsWith('en-')) {
      return 'en-US';
    }
    return null;
  }

  /**
   * Replaces token placeholders in a localized string.
   *
   * @param {string} template Translation template.
   * @param {Record<string, unknown>} vars Interpolation variables.
   * @returns {string} Interpolated string.
   */
  function interpolate(template: string, vars?: Record<string, unknown>) {
    if (!template || !vars) {
      return template;
    }
    return String(template).replace(/\{\{(\w+)\}\}/g, (_full, key) =>
      Object.hasOwn(vars, key) ? String(vars[key]) : '',
    );
  }

  /**
   * Resolves a translation key with optional fallback and interpolation.
   *
   * @param {string} key Translation key.
   * @param {string} fallback Fallback message.
   * @param {Record<string, unknown>} vars Interpolation variables.
   * @returns {string} Localized text.
   */
  function t(key: string, fallback?: string, vars?: Record<string, unknown>) {
    const locale = api.currentLocale || DEFAULT_LOCALE;
    const catalog = STRINGS[locale] || STRINGS[DEFAULT_LOCALE];
    const base =
      catalog[key] || STRINGS[DEFAULT_LOCALE][key] || fallback || key;
    return interpolate(base, vars);
  }

  /**
   * Resolves locale from query params, storage, document, and browser preferences.
   *
   * @returns {'en-US'|'es-419'} Resolved locale.
   */
  function resolveLocale() {
    if (
      typeof global.location !== 'undefined' &&
      typeof global.location.search === 'string'
    ) {
      const params = new URLSearchParams(global.location.search);
      const fromQuery = normalizeLocale(params.get('lang'));
      if (fromQuery) {
        return fromQuery;
      }
    }

    if (typeof localStorage !== 'undefined') {
      try {
        const fromStorage = normalizeLocale(localStorage.getItem(STORAGE_KEY));
        if (fromStorage) {
          return fromStorage;
        }
      } catch (_error) {}
    }

    if (typeof document !== 'undefined' && document.documentElement) {
      const fromHtml = normalizeLocale(document.documentElement.lang);
      if (fromHtml) {
        return fromHtml;
      }
    }

    if (typeof navigator !== 'undefined') {
      const list = Array.isArray(navigator.languages)
        ? navigator.languages
        : [];
      for (let i = 0; i < list.length; i++) {
        const normalized = normalizeLocale(list[i]);
        if (normalized) {
          return normalized;
        }
      }
      const fromNavigator = normalizeLocale(navigator.language);
      if (fromNavigator) {
        return fromNavigator;
      }
    }

    return DEFAULT_LOCALE;
  }

  /**
   * Applies data-attribute-based translations to a root node.
   *
   * @param {Document|Element} root DOM root for translation updates.
   * @returns {void}
   */
  function applyTranslations(root: Document | Element) {
    if (!root?.querySelectorAll) {
      return;
    }

    root.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.getAttribute('data-i18n') || '');
    });

    root.querySelectorAll('[data-i18n-html]').forEach(el => {
      el.innerHTML = t(el.getAttribute('data-i18n-html') || '');
    });

    root.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title') || ''));
    });

    root.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
      el.setAttribute(
        'aria-label',
        t(el.getAttribute('data-i18n-aria-label') || ''),
      );
    });

    root.querySelectorAll('[data-i18n-alt]').forEach(el => {
      el.setAttribute('alt', t(el.getAttribute('data-i18n-alt') || ''));
    });

    applyLegacyLeafText(root);
  }

  /**
   * Returns cached map keys sorted by length, longest first.
   *
   * @param {Record<string, string>} map Replacement map.
   * @returns {string[]} Sorted keys.
   */
  function getSortedReplacementKeys(map) {
    const cacheKey = Object.keys(map).join('||');
    if (!Object.hasOwn(LEGACY_REPLACE_CACHE, cacheKey)) {
      LEGACY_REPLACE_CACHE[cacheKey] = Object.keys(map).sort(
        (a, b) => b.length - a.length,
      );
    }
    return LEGACY_REPLACE_CACHE[cacheKey];
  }

  /**
   * Applies fragment substitutions using a translation map.
   *
   * @param {string} value Source text.
   * @param {Record<string, string>} map Replacement map.
   * @returns {string} Text with substitutions applied.
   */
  function applyFragmentMap(value, map) {
    if (!value || typeof value !== 'string') {
      return value;
    }
    let result = value;
    const keys = getSortedReplacementKeys(map);
    for (let i = 0; i < keys.length; i++) {
      const source = keys[i];
      const target = map[source];
      if (result.indexOf(source) !== -1) {
        result = result.split(source).join(target);
      }
    }
    return result;
  }

  /**
   * Translates a dynamic legacy data label using locale-specific maps.
   *
   * @param {string} value Label text.
   * @param {string} locale Locale override.
   * @returns {string} Translated label when available.
   */
  function translateLegacyText(
    value: string | null | undefined,
    locale?: string,
  ) {
    if (value == null) {
      return value;
    }
    const currentLocale =
      normalizeLocale(locale) || api.currentLocale || DEFAULT_LOCALE;
    if (currentLocale === 'en-US') {
      return String(value);
    }

    const text = String(value);
    const exactMap = LEGACY_DATA_LABEL_MAP[currentLocale];
    if (exactMap && Object.hasOwn(exactMap, text)) {
      return exactMap[text];
    }
    if (exactMap) {
      const translatedFromDataMap = applyFragmentMap(text, exactMap);
      if (translatedFromDataMap !== text) {
        return translatedFromDataMap;
      }
    }

    const fragmentMap = LEGACY_TEXT_MAP[currentLocale];
    if (fragmentMap) {
      return applyFragmentMap(text, fragmentMap);
    }
    return text;
  }

  /**
   * Translates legacy text fragments in selected element attributes.
   *
   * @param {Document|Element} root Root node.
   * @param {Record<string, string>} attributeMap Translation map.
   * @returns {void}
   */
  function applyLegacyAttributeTranslations(
    root: Document | Element,
    attributeMap?: Record<string, string>,
  ) {
    if (!attributeMap) {
      return;
    }
    root
      .querySelectorAll('[title],[aria-label],[alt],[placeholder]')
      .forEach(el => {
        ['title', 'aria-label', 'alt', 'placeholder'].forEach(attrName => {
          if (!el.hasAttribute(attrName)) {
            return;
          }
          const current = el.getAttribute(attrName);
          const translated = applyFragmentMap(current, attributeMap);
          if (translated !== current) {
            el.setAttribute(attrName, translated);
          }
        });
      });
  }

  /**
   * Translates legacy free-text nodes across the rendered document.
   *
   * @param {Document|Element} root Root node.
   * @param {Record<string, string>} textMap Translation map.
   * @returns {void}
   */
  function applyLegacyTextNodeTranslations(
    root: Document | Element,
    textMap?: Record<string, string>,
  ) {
    if (!textMap || typeof document === 'undefined') {
      return;
    }
    const container =
      root.nodeType === 9
        ? (root as Document).body || (root as Document).documentElement
        : root;
    if (!container) {
      return;
    }

    const nodeFilter =
      typeof NodeFilter !== 'undefined' ? NodeFilter.SHOW_TEXT : 4;
    const walker = document.createTreeWalker(container, nodeFilter);
    const blockedParents = {
      SCRIPT: true,
      STYLE: true,
      TEXTAREA: true,
    };

    let node = walker.nextNode();
    while (node) {
      const parentTag = node.parentNode && node.parentNode.nodeName;
      if (!blockedParents[parentTag]) {
        const raw = String(node.nodeValue || '');
        if (raw.trim()) {
          const translated = applyFragmentMap(raw, textMap);
          if (translated !== raw) {
            node.nodeValue = translated;
          }
        }
      }
      node = walker.nextNode();
    }
  }

  /**
   * Translates the document title using the legacy text map.
   *
   * @param {'en-US'|'es-419'} locale Active locale.
   * @returns {void}
   */
  function applyLegacyDocumentTitleTranslations(locale) {
    if (typeof document === 'undefined') {
      return;
    }
    const textMap = LEGACY_TEXT_MAP[locale];
    if (!textMap) {
      return;
    }
    const currentTitle = String(document.title || '');
    const translated = applyFragmentMap(currentTitle, textMap);
    if (translated !== currentTitle) {
      document.title = translated;
    }
  }

  /**
   * Applies legacy attribute, text-node, and title translations.
   *
   * @param {Document|Element} root Root node.
   * @returns {void}
   */
  function applyLegacyLeafText(root: Document | Element) {
    const locale = api.currentLocale || DEFAULT_LOCALE;
    if (locale === 'en-US') {
      return;
    }

    applyLegacyAttributeTranslations(root, LEGACY_ATTRIBUTE_MAP[locale]);
    applyLegacyTextNodeTranslations(root, LEGACY_TEXT_MAP[locale]);
    applyLegacyDocumentTitleTranslations(locale);
  }

  /**
   * Appends the active locale to same-origin links in a DOM root.
   *
   * @param {'en-US'|'es-419'} locale Active locale.
   * @param {Document|Element} root Root node.
   * @returns {void}
   */
  function propagateLocaleToLinks(
    locale: 'en-US' | 'es-419',
    root: Document | Element,
  ) {
    if (!root?.querySelectorAll || !global.location) {
      return;
    }
    root.querySelectorAll('a[href]').forEach(anchor => {
      const href = anchor.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:')
      ) {
        return;
      }
      let url;
      try {
        url = new URL(href, global.location.href);
      } catch (_error) {
        return;
      }
      if (url.origin !== global.location.origin) {
        return;
      }
      url.searchParams.set('lang', locale);
      anchor.setAttribute('href', url.pathname + url.search + url.hash);
    });
  }

  /**
   * Sets the active locale and re-renders translated content.
   *
   * @param {string} locale Requested locale.
   * @param {{persist?: boolean}} options Optional behavior flags.
   * @returns {void}
   */
  function setLocale(locale: string, options?: {persist?: boolean}) {
    const normalized = normalizeLocale(locale) || DEFAULT_LOCALE;
    api.currentLocale = normalized;
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = normalized;
    }
    if (options?.persist !== false) {
      try {
        localStorage.setItem(STORAGE_KEY, normalized);
      } catch (_error) {}
    }
    if (typeof document !== 'undefined') {
      applyTranslations(document);
      propagateLocaleToLinks(normalized, document);
      document.querySelectorAll('[data-locale-selector]').forEach(select => {
        (select as HTMLSelectElement).value = normalized;
      });
    }
    if (
      global.history &&
      global.location &&
      typeof global.history.replaceState === 'function'
    ) {
      const next = new URL(global.location.href);
      next.searchParams.set('lang', normalized);
      global.history.replaceState(
        {},
        '',
        next.pathname + next.search + next.hash,
      );
    }
  }

  /**
   * Initializes locale state and language selector bindings.
   *
   * @returns {void}
   */
  function init() {
    const locale = resolveLocale();
    setLocale(locale);

    if (typeof document !== 'undefined') {
      document.querySelectorAll('[data-locale-selector]').forEach(select => {
        (select as HTMLSelectElement).addEventListener('change', event => {
          const nextLocale =
            event.target instanceof HTMLSelectElement
              ? event.target.value
              : DEFAULT_LOCALE;
          setLocale(nextLocale);
        });
      });
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
    translateLegacyText,
    applyTranslations,
    propagateLocaleToLinks,
    setLocale,
    init,
  };

  const bootLocale = resolveLocale();
  api.currentLocale = bootLocale;
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = bootLocale;
  }

  global.obI18n = api;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
