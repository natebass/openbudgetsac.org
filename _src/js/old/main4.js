$(function () {
  const DEFAULT_DRILLDOWNS = ['fund', 'department', 'unit']
  const DEFAULT_CUTS = { 'time.year': '2013' }
  const DEFAULT_HEADER = "Mayor's Proposed Two-Year Spending (2013-15)"
  const ROOT_CRUMB_TITLE = 'Funds'
  const CANNOT_DIG_DEEPER_FALLBACK = "Sorry, we can't dig deeper"

  const drilldowns = DEFAULT_DRILLDOWNS.slice()
  let cuts = Object.assign({}, DEFAULT_CUTS)
  let headerText = DEFAULT_HEADER

  const parameters = $.url().param()
  const yearsSelection = buildYearSelection(parameters.reference_years, '-')
  if (yearsSelection) {
    cuts = { 'time.year': yearsSelection.cutString }
    headerText = yearsSelection.headerText + " Mayor's Proposed Spending"
  }

  $('#year-header').text(headerText)

  const crumbs = [{ path: $.url().attr('path'), title: ROOT_CRUMB_TITLE }]
  while (drilldowns[0] in parameters) {
    const drill = drilldowns.shift()
    cuts[drill] = parameters[drill]
    crumbs.push({
      path: buildCrumbPath(crumbs, drill, parameters[drill]),
      title: parameters[drill]
    })
  }

  renderBreadcrumbs(crumbs)

  const state = { drilldowns, cuts }
  const context = {
    dataset: 'mayor_s_proposed_policy_budget_fy2013-15',
    siteUrl: 'http://openspending.org',
    drilldown: function (node) {
      if (node.data.node.children.length) {
        window.location.href = buildDrilldownLocation(drilldowns[0], node.name)
        return
      }
      alert(getCannotDigDeeperMessage(CANNOT_DIG_DEEPER_FALLBACK))
    }
  }

  window.wdg_widget = new OpenSpending.Treemap($('#treewidget13-15'), context, state)

  function buildYearSelection (referenceYears, headerJoiner) {
    if (!referenceYears) {
      return null
    }

    let cutString = ''
    let displayYears = ''
    const years = referenceYears.split(' ')

    $.each(years, function (index, year) {
      if (index !== 0) {
        cutString += '|time.year:'
        displayYears += headerJoiner
      }
      cutString += year
      displayYears += year
    })

    return {
      cutString,
      headerText: displayYears
    }
  }

  function buildCrumbPath (crumbList, drill, parameterValue) {
    return [
      crumbList[crumbList.length - 1].path,
      crumbList.length > 1 ? '&' : '?',
      drill,
      '=',
      parameterValue
    ].join('')
  }

  function renderBreadcrumbs (crumbList) {
    const breadcrumbsEl = $('#breadcrumbs')
    breadcrumbsEl.empty()

    for (let index = 0; index < crumbList.length; index++) {
      if (index > 0) {
        breadcrumbsEl.append(document.createTextNode(' > '))
      }
      $('<a></a>')
        .attr('href', crumbList[index].path)
        .text(crumbList[index].title)
        .appendTo(breadcrumbsEl)
    }
  }

  function buildDrilldownLocation (nextDrilldown, nodeName) {
    return [
      window.location.href,
      window.location.search ? '&' : '?',
      nextDrilldown,
      '=',
      encodeURIComponent(nodeName)
    ].join('')
  }

  function getCannotDigDeeperMessage (fallback) {
    if (window.obI18n && typeof window.obI18n.t === 'function') {
      return window.obI18n.t('old.alert.cannotDigDeeper', fallback)
    }
    return fallback
  }
})
