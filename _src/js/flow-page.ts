interface FlowFileRecord {
  filename: string;
}

interface FlowDisplayRecord extends FlowFileRecord {
  displayName: string;
  fy: string;
  type: string;
}

const FLOW_FILENAME_ALIASES: Record<string, string> = {
  'FY13-14__adopted.csv': 'FY14.csv',
  'FY14-15__adopted.csv': 'FY15.csv',
  'FY14-15__adjusted.csv': 'FY15.csv',
  'FY15-16__adopted.csv': 'FY16.csv',
  'FY16-17__adopted.csv': 'FY17.csv',
  'FY15-16__proposed.csv': 'FY16.csv',
  'FY16-17__proposed.csv': 'FY17.csv',
  'FY16-17__adjusted.csv': 'FY17.csv',
  'FY17-18__proposed.csv': 'FY18.csv',
  'FY18-19__proposed.csv': 'FY19.csv',
};

declare function data_wrangle(dataset: Array<Record<string, any>>, fy: string): any;
declare function do_with_budget(data: any): void;

/**
 * Resolves a localized message with optional interpolation.
 *
 * @param {string} key Translation key.
 * @param {string} fallback Fallback message.
 * @param {Record<string, unknown>} [vars] Interpolation values.
 * @returns {string} Localized text.
 */
function flowPageI18nT(key: string, fallback: string, vars?: Record<string, unknown>): string {
  if (window.obI18n && typeof window.obI18n.t === 'function') {
    return window.obI18n.t(key, fallback, vars);
  }
  if (!vars) {
    return fallback;
  }
  return fallback.replace(/\{\{(\w+)\}\}/g, function(_full, name) {
    return Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : '';
  });
}

/**
 * Resolves a legacy filename alias to the normalized data asset name.
 *
 * @param {string} filename Raw filename from page markup.
 * @returns {string} Normalized filename.
 */
function resolveFlowFilename(filename: string): string {
  if (!filename) {
    return '';
  }
  if (FLOW_FILENAME_ALIASES[filename]) {
    return FLOW_FILENAME_ALIASES[filename];
  }
  if (/^FY\d{2}\.csv$/.test(filename)) {
    return filename;
  }
  const legacyMatch = filename.match(/^FY(\d{2})-\d{2}(?:__[\w-]+)?\.csv$/);
  if (legacyMatch) {
    return `FY${legacyMatch[1]}.csv`;
  }
  return filename;
}

/**
 * Updates the flow status region with the current load state.
 *
 * @param {string} message Screen-readable status text.
 * @param {boolean} isError Whether the message describes an error.
 * @returns {void}
 */
function showFlowStatus(message: string, isError: boolean): void {
  const status = d3.select('#hover_description');
  status
    .attr('role', isError ? 'alert' : 'status')
    .attr('aria-live', isError ? 'assertive' : 'polite')
    .text(message);
}

/**
 * Reads flow file metadata from JSON bootstrap data or hidden inputs.
 *
 * @returns {FlowFileRecord[]} Available CSV file records.
 */
function readFlowFiles(): Array<FlowFileRecord> {
  const jsonScript = document.getElementById('flow-datafiles');
  if (jsonScript?.textContent?.trim()) {
    try {
      return JSON.parse(jsonScript.textContent) as Array<FlowFileRecord>;
    } catch (error) {
      console.error('Unable to parse flow datafile bootstrap JSON.', error);
      return [];
    }
  }

  return Array.from(document.querySelectorAll<HTMLInputElement>('input.filename-data'))
    .map(function(inputEl) {
      return {filename: inputEl.value};
    });
}

/**
 * Builds the display metadata used by the fiscal-year dropdown.
 *
 * @param {FlowFileRecord[]} files Raw file list.
 * @returns {FlowDisplayRecord[]} Sorted display records.
 */
function buildFlowDisplayFiles(files: Array<FlowFileRecord>): Array<FlowDisplayRecord> {
  return files
    .map(function(file) {
      const nameParts = file.filename.slice(0, -4).split('__');
      return {
        filename: file.filename,
        displayName: nameParts.join(' '),
        fy: nameParts[0],
        type: nameParts[1] || '',
      };
    })
    .sort(function(left, right) {
      const sortYear = d3.descending(left.fy, right.fy);
      const sortType = d3.ascending(left.type, right.type);
      return sortYear !== 0 ? sortYear : sortType;
    });
}

/**
 * Initializes the shared flow page controls and chart loading.
 *
 * @returns {void}
 */
function initFlowPage(): void {
  const selectNode = document.querySelector<HTMLSelectElement>('#fy.form-control');
  if (!selectNode || typeof data_wrangle !== 'function' || typeof do_with_budget !== 'function') {
    return;
  }

  const files = buildFlowDisplayFiles(readFlowFiles());
  if (files.length === 0) {
    showFlowStatus(
      flowPageI18nT(
        'flow.unableLoadChartData',
        'Unable to load chart data for {{fy}}. Please try another fiscal year or refresh the page.',
        {fy: 'unknown year'},
      ),
      true,
    );
    return;
  }

  const fySelect = d3.select(selectNode);
  fySelect.selectAll('option')
    .data(files)
    .enter()
    .append('option')
    .attr('value', function(d: FlowDisplayRecord) {return d.filename;})
    .property('selected', function(_d: FlowDisplayRecord, index: number) {return index === 0;})
    .text(function(d: FlowDisplayRecord) {return d.displayName;});

  /**
   * Loads the selected flow CSV and redraws the chart.
   *
   * @returns {boolean} False when the selected year is not usable.
   */
  function drawFlow(): boolean {
    if (!selectNode.value) {
      showFlowStatus(
        flowPageI18nT(
          'flow.unableLoadChartData',
          'Unable to load chart data for {{fy}}. Please try another fiscal year or refresh the page.',
          {fy: 'unknown year'},
        ),
        true,
      );
      return false;
    }

    const rawFilename = selectNode.value;
    const filename = resolveFlowFilename(rawFilename);
    const fy = filename.slice(0, -4);

    d3.csv(`/data/flow/${filename}`, function(error: any, data: Array<Record<string, any>>) {
      if (error) {
        console.error(`Unable to load flow chart data for file: ${filename} (selected: ${rawFilename})`, error);
        showFlowStatus(
          flowPageI18nT(
            'flow.unableLoadChartData',
            'Unable to load chart data for {{fy}}. Please try another fiscal year or refresh the page.',
            {fy},
          ),
          true,
        );
        return false;
      }

      const finalData = data_wrangle(data, fy);
      do_with_budget(finalData);
      showFlowStatus(
        flowPageI18nT('flow.showingChartFor', 'Showing chart for {{fy}}.', {fy}),
        false,
      );
      return true;
    });
    return true;
  }

  fySelect.on('change', drawFlow);
  showFlowStatus(flowPageI18nT('flow.loadingChartData', 'Loading chart data...'), false);
  drawFlow();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFlowPage);
} else {
  initFlowPage();
}
