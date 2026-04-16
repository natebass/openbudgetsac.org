interface TreePageConfig {
  dropdownValues: Record<string, Array<string>>;
  dropdownChoice: Record<string, string>;
  urlTemplate: string;
}

/**
 * Reads the tree page configuration from the JSON bootstrap block.
 *
 * @returns {TreePageConfig | null} Parsed config or null when absent.
 */
function readTreeConfig(): TreePageConfig | null {
  const script = document.getElementById('tree-config');
  if (!script?.textContent?.trim()) {
    return null;
  }
  try {
    return JSON.parse(script.textContent) as TreePageConfig;
  } catch (error) {
    console.error('Unable to parse tree page configuration.', error);
    return null;
  }
}

/**
 * Normalizes hash segments so legacy routes stay stable across casing changes.
 *
 * @param {string} value Raw hash segment.
 * @returns {string} Normalized segment.
 */
function normalizeTreeHash(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '');
}

/**
 * Compares normalized hash path values.
 *
 * @param {string} left Left path value.
 * @param {string} right Right path value.
 * @returns {number} Zero when values match.
 */
function compareTreeHash(left: string, right: string): number {
  return normalizeTreeHash(left) === normalizeTreeHash(right) ? 0 : 1;
}

/**
 * Builds the current data URL from the dropdown choices and configured template.
 *
 * @param {TreePageConfig} config Page configuration.
 * @returns {string} Resolved JSON data URL.
 */
function resolveTreeUrl(config: TreePageConfig): string {
  let url = config.urlTemplate;
  Object.keys(config.dropdownChoice).forEach(key => {
    url = url.replace(
      new RegExp(`\\{${key}\\}`, 'g'),
      config.dropdownChoice[key],
    );
  });
  return url;
}

/**
 * Applies the URL hash to the tree dropdown state before the first render.
 *
 * @param {TreePageConfig} config Page configuration.
 * @param {string} hash Raw location hash.
 * @returns {string} Remaining tree path after dropdown values are consumed.
 */
function parseTreeHash(config: TreePageConfig, hash: string): string {
  function parseHashDropdown(parts: Array<string>, category: string): void {
    if (!parts.length) {
      return;
    }
    const nextValue = parts.shift();
    const index = ob.data.findIndex(
      config.dropdownValues[category],
      nextValue,
      compareTreeHash,
    );
    if (index > -1) {
      config.dropdownChoice[category] = config.dropdownValues[category][index];
    }
  }

  const hashParts = hash.split('.');
  parseHashDropdown(hashParts, 'Year');
  parseHashDropdown(hashParts, 'Account');
  return hashParts.join('.');
}

/**
 * Initializes the shared tree page renderer.
 *
 * @returns {void}
 */
function initTreePage(): void {
  const config = readTreeConfig();
  if (!config || !ob?.display?.budget_treemap) {
    return;
  }

  parseTreeHash(config, window.location.hash.replace('#', ''));

  const parent = d3.select('.container');
  const parentNode = parent.node() as HTMLElement | null;
  if (!parentNode) {
    return;
  }

  const width =
    parentNode.offsetWidth -
    parseInt(parent.style('padding-left'), 10) -
    parseInt(parent.style('padding-right'), 10);

  const runtimeConfig = {
    dropdown_values: config.dropdownValues,
    dropdown_choice: config.dropdownChoice,
    url: () =>
      resolveTreeUrl({
        dropdownValues: config.dropdownValues,
        dropdownChoice: runtimeConfig.dropdown_choice,
        urlTemplate: config.urlTemplate,
      }),
  };

  ob.display
    .budget_treemap()
    .width(width)
    .height(600)
    .count(40)
    .config(runtimeConfig)
    .dropdown('#dropdown')
    .spreadsheet('#table')
    .treemap('#treemap')
    .title('#title')
    .hashnorm(normalizeTreeHash)
    .hashcmp(compareTreeHash)
    .on('set_hash', (hash: string) => {
      const prefix =
        normalizeTreeHash(runtimeConfig.dropdown_choice.Year) +
        '.' +
        normalizeTreeHash(runtimeConfig.dropdown_choice.Account);
      return hash.length ? `${prefix}.${hash}` : prefix;
    })
    .on('get_hash', (hash: string) =>
      parseTreeHash(
        {
          dropdownValues: config.dropdownValues,
          dropdownChoice: runtimeConfig.dropdown_choice,
          urlTemplate: config.urlTemplate,
        },
        hash,
      ),
    )
    .url(runtimeConfig.url())
    .create();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTreePage);
} else {
  initTreePage();
}
