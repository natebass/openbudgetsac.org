interface LegacySankeyNode {
  name: string;
  x?: number;
  y?: number;
  dx?: number;
  dy?: number;
  value?: number;
  color?: string;
}

interface LegacySankeyLink {
  source: number | LegacySankeyNode;
  target: number | LegacySankeyNode;
  value: number;
  dy?: number;
}

interface LegacySankeyData {
  nodes: Array<LegacySankeyNode>;
  links: Array<LegacySankeyLink>;
}

/**
 * Initializes the archived 2012-13 sankey page.
 *
 * @returns {void}
 */
function initOldSankeyPage(): void {
  const chartRoot = document.querySelector('#chart');
  const sankeyHost = document.querySelector<HTMLElement>('#sankey[data-legacy-sankey-url]');
  if (!chartRoot || !sankeyHost || typeof d3?.sankey !== 'function') {
    return;
  }

  const dataUrl = sankeyHost.getAttribute('data-legacy-sankey-url');
  if (!dataUrl) {
    return;
  }

  const margin = {top: 1, right: 1, bottom: 6, left: 1};
  const width = 960 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;
  const formatNumber = d3.format(',.0f');
  const format = function(value: number): string {
    return `$${formatNumber(value)}`;
  };
  const color = d3.scale.category20();
  const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const sankey = d3.sankey()
    .nodeWidth(30)
    .nodePadding(5)
    .size([width, height]);

  const path = sankey.link();

  /**
   * Renders the archived sankey data.
   *
   * @param {LegacySankeyData} data Sankey graph data.
   * @returns {void}
   */
  function renderBudget(data: LegacySankeyData): void {
    sankey
      .nodes(data.nodes)
      .links(data.links)
      .layout(32);

    const link = svg.append('g').selectAll('.link')
      .data(data.links)
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', path)
      .style('stroke-width', function(d: LegacySankeyLink) {return Math.max(1, d.dy || 0);})
      .sort(function(left: LegacySankeyLink, right: LegacySankeyLink) {
        return (right.dy || 0) - (left.dy || 0);
      })
      .on('mouseover', function(d: LegacySankeyLink) {
        $('#hover_description').append($(`<span>${(d.source as LegacySankeyNode).name} to ${(d.target as LegacySankeyNode).name}: ${format(d.value)}</span>`));
      })
      .on('mouseout', function() {
        $('#hover_description').find('span:last').remove();
      });

    link.append('title')
      .text(function(d: LegacySankeyLink) {
        return `${(d.source as LegacySankeyNode).name} → ${(d.target as LegacySankeyNode).name}\n${format(d.value)}`;
      });

    const node = svg.append('g').selectAll('.node')
      .data(data.nodes)
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', function(d: LegacySankeyNode) {return `translate(${d.x},${d.y})`;});

    node.append('rect')
      .attr('height', function(d: LegacySankeyNode) {return d.dy;})
      .attr('width', sankey.nodeWidth())
      .style('fill', function(d: LegacySankeyNode) {
        d.color = color(d.name.replace(/ .*/, ''));
        return d.color;
      })
      .style('stroke', function(d: LegacySankeyNode) {return d3.rgb(d.color).darker(2);})
      .append('title')
      .text(function(d: LegacySankeyNode) {return `${d.name}\n${format(d.value || 0)}`;});

    node.append('text')
      .attr('x', -6)
      .attr('y', function(d: LegacySankeyNode) {return (d.dy || 0) / 2;})
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .attr('transform', null)
      .text(function(d: LegacySankeyNode) {return d.name;})
      .filter(function(d: LegacySankeyNode) {return (d.x || 0) < width / 2;})
      .attr('x', 6 + sankey.nodeWidth())
      .attr('text-anchor', 'start');
  }

  d3.json(dataUrl, function(error: any, data: LegacySankeyData) {
    if (error || !data) {
      console.error('Unable to load legacy sankey data.', error);
      return;
    }
    renderBudget(data);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOldSankeyPage);
} else {
  initOldSankeyPage();
}
