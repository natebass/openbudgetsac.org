/* global alert */
$(function () {
  const DEFAULT_DRILLDOWNS = ['department', 'unit', 'fund']
  const DEFAULT_CUTS = { 'time.year': '2013|time.year:2014' }
  const ROOT_CRUMB_TITLE = 'Departments'
  const CANNOT_DIG_DEEPER_FALLBACK = "Sorry, we can't dig deeper"

  const drilldowns = DEFAULT_DRILLDOWNS.slice()
  const cuts = Object.assign({}, DEFAULT_CUTS)
  const parameters = $.url().param()
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

  /**
   * Builds a breadcrumb URL for the next drilldown state.
   *
   * @param {any} crumbList Input value.
   * @param {any} drill Input value.
   * @param {any} parameterValue Input value.
   * @returns {any} Function result.
   */
  function buildCrumbPath (crumbList, drill, parameterValue) {
    return [
      crumbList[crumbList.length - 1].path,
      crumbList.length > 1 ? '&' : '?',
      drill,
      '=',
      parameterValue
    ].join('')
  }

  /**
   * Renders breadcrumb links for the current drilldown path.
   *
   * @param {any} crumbList Input value.
   * @returns {any} Function result.
   */
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

  /**
   * Builds the next page URL for a drilldown click.
   *
   * @param {any} nextDrilldown Input value.
   * @param {any} nodeName Input value.
   * @returns {any} Function result.
   */
  function buildDrilldownLocation (nextDrilldown, nodeName) {
    return [
      window.location.href,
      window.location.search ? '&' : '?',
      nextDrilldown,
      '=',
      encodeURIComponent(nodeName)
    ].join('')
  }

  /**
   * Resolves the localized fallback alert for terminal drilldown nodes.
   *
   * @param {any} fallback Input value.
   * @returns {any} Function result.
   */
  function getCannotDigDeeperMessage (fallback) {
    if (window.obI18n && typeof window.obI18n.t === 'function') {
      return window.obI18n.t('old.alert.cannotDigDeeper', fallback)
    }
    return fallback
  }
})
