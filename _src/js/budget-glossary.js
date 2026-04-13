/**
 * Checks whether validate res.
 *
 * @param {any} res Input value.
 * @returns {any} Function result.
 */
function validateRes (res) {
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText || 'Request failed'}`)
  }
  return res
}

/**
 * Builds format res.
 *
 * @param {any} res Input value.
 * @returns {any} Function result.
 */
function formatRes (res) {
  return res.json()
}

/**
 * Sets save res.
 *
 * @param {any} formattedRes Input value.
 * @returns {any} Function result.
 */
function saveRes (formattedRes) {
  if (window.localStorage && formattedRes && formattedRes.data && Array.isArray(formattedRes.data.budgetterms)) {
    const ls = window.localStorage
    const terms = formattedRes.data.budgetterms.slice(1)
    terms.forEach((term) => {
      if (term[2] && term[2].length > 0) {
        try {
          ls.setItem(term[0], term[2])
        } catch (storageError) {
          // Storage can fail in private mode or when quota is exhausted.
          console.warn('Unable to persist glossary entry in localStorage', storageError)
        }
      }
    })
  } else {
    console.warn('Glossary response missing expected "budgetterms" data')
  }
}
/**
 * Runs log error.
 *
 * @param {any} err Input value.
 * @returns {any} Function result.
 */
function logError (err) {
  console.error(`Oops! ${err}`)
}

/**
 * Gets fetch definitions.
 *
 * @param {any} url Input value.
 * @param {any} options Input value.
 * @returns {any} Function result.
 */
function fetchDefinitions (url, options = {}) {
  const controller = new AbortController()
  // Abort stale requests so glossary fetch does not hang page initialization.
  const timeout = window.setTimeout(() => controller.abort(), 10000)

  fetch(url, Object.assign({}, options, { signal: controller.signal }))
    .then(validateRes)
    .then(formatRes)
    .then(saveRes)
    .finally(() => {
      window.clearTimeout(timeout)
    })
    .catch(logError)
}

fetchDefinitions('https://oboterms-g55nbvma6a-wn.a.run.app/Overview')

// prepareToAppendDefinitions();
