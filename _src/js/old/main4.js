$(function () {
  // Default drilldowns and cuts and year
  const drilldowns = ['fund', 'department', 'unit']

  // Default year cuts
  let cuts = { 'time.year': '2013' }
  // Default header text
  let headerText = "Mayor's Proposed Two-Year Spending (2013-15)"

  // Use purl to preserve legacy behavior expected by old deep links.
  // Purl is available here: https://github.com/allmarkedup/jQuery-URL-Parser
  const parameters = $.url().param()

  // check for 'reference_years' in URL parameters
  // argument must be formatted with four digit years, eg. 2012
  // separate multiple years with a '+' symbol, but you need only supply one
  // the cuts used by default would correspond to: reference_years=2013+2014

  if (parameters.reference_years) {
    // Initialize output strings, then parse year values from the URL argument.

    let cutString = ''
    headerText = ''
    const years = parameters.reference_years.split(' ')
    let i = 0

    // loop through the list of years

    $.each(years, function (index, value) {
      // the first argument has nothing preceding it
      if (i !== 0) {
        // after the first, prepend the new cut and the '|' to perform and addition
        cutString += '|time.year:'
        headerText += '-'
      }
      // add the year
      cutString += value
      headerText += value
      i++
    })
    // apply the formatted cuts string
    cuts = { 'time.year': cutString }
    headerText += " Mayor's Proposed Spending"
  }

  $('#year-header').text(headerText)
  // Start collecting breadcrumbs. We begin with Funds (base url)
  const path = $.url().attr('path')
  const crumbs = [{ path, title: 'Funds' }]

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
    dataset: 'mayor_s_proposed_policy_budget_fy2013-15',
    siteUrl: 'http://openspending.org',
    drilldown: function (node) { // Gets called on node click
      // If the node has children we can drill more
      if (node.data.node.children.length) {
        // We create a new location by adding a url parameter
        // Then we have to check if we need to add ? or &
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
        alert("That's as low as we go.")
      }
    }
  }
  // Create the Treemap
  window.wdg_widget = new OpenSpending.Treemap($('#treewidget13-15'), context, state)
})
