$(function () {
  // Default drilldowns and cuts
  const drilldowns = ['department', 'unit', 'child-fund']
  const cuts = { 'time.year': '2011|time.year:2012' }

  // Use purl to preserve legacy behavior expected by old deep links.
  // Purl is available here: https://github.com/allmarkedup/jQuery-URL-Parser
  const parameters = $.url().param()

  // Start collecting breadcrumbs. We begin with Departments (base url)
  const path = $.url().attr('path')
  const crumbs = [{ path, title: 'Departments' }]

  // While the first drilldown is in the url parameters
  // we move it to the cuts instead
  while (drilldowns[0] in parameters) {
    const drill = drilldowns.shift()
    cuts[drill] = parameters[drill]
    // Add crumb to our crumbs.
    // The path is computed from the preceding crumb, then we append
    // the new url parameter for this particular crumb
    crumbs.push({
      path: [crumbs[crumbs.length - 1].path,
        (crumbs.length > 1) ? '&' : '?',
        drill, '=', parameters[drill]].join(''),
      title: parameters[drill]
    })
  }

  // Create the links for our crumbs
  const breadcrumbsEl = $('#breadcrumbs')
  breadcrumbsEl.empty()
  for (let idx = 0; idx < crumbs.length; idx++) {
    if (idx > 0) {
      breadcrumbsEl.append(document.createTextNode(' > '))
    }
    $('<a></a>')
      .attr('href', crumbs[idx].path)
      .text(crumbs[idx].title)
      .appendTo(breadcrumbsEl)
  }

  // Create the state from the (possibly modified) drilldowns and cuts
  const state = {
    drilldowns,
    cuts
  }

  const context = {
    dataset: 'sacramento-adopted-budget-fy-2011-13-expenditures',
    siteUrl: 'http://openspending.org',
    drilldown: function (node) { // Gets called on node click
      // If the node has children we can drill more
      if (node.data.node.children.length) {
        // We create a new location by adding a url parameter
        // We must choose ? or & based on whether query params already exist.
        // (it depends on if there are any url parameters present).
        // The url parameter is of the form dimension=name
        const newLocation = [window.location.href,
          window.location.search ? '&' : '?',
          drilldowns[0], '=',
          encodeURIComponent(node.name)]
        // Go to the new location
        window.location.href = newLocation.join('')
      } else {
        // If the node doesn't have children we notify the user
        // This can be made more beautiful
        alert((window.obI18n && window.obI18n.t) ? window.obI18n.t('old.alert.cannotDigDeeper', "Sorry, we can't dig deeper") : "Sorry, we can't dig deeper")
      }
    }
  }
  // Create the Treemap
  window.wdg_widget = new OpenSpending.Treemap($('#treewidget11-13'), context, state)
})
