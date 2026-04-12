const puppeteer = require('puppeteer')
const axeSourcePath = require.resolve('axe-core/axe.min.js')

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:8011'
const IPHONE_6_VIEWPORT = { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const NAVIGATION_TIMEOUT_MS = 60000

jest.setTimeout(120000)

describe('compare page e2e', () => {
  let browser
  let page

  beforeAll(async () => {
    const args = process.getuid && process.getuid() === 0
      ? ['--no-sandbox', '--disable-setuid-sandbox']
      : []

    browser = await puppeteer.launch({
      headless: true,
      args
    })
    page = await browser.newPage()
    await page.setViewport({ width: 1400, height: 900 })
  })

  afterAll(async () => {
    if (browser) {
      await browser.close()
    }
  })

  function formatA11yViolations (violations) {
    return violations.map((violation) => {
      const impactedNodes = violation.nodes.slice(0, 3).map((node) => {
        return node.target.join(' ')
      })
      const targets = impactedNodes.length > 0 ? impactedNodes.join(', ') : '(no node targets)'
      return `${violation.id} [${violation.impact || 'unknown'}] on ${targets}`
    }).join('\n')
  }

  test('renders compare experience with controls and breakdown tabs', async () => {
    await page.goto(`${BASE_URL}/compare/`, { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT_MS })

    await page.waitForSelector('#root h1', { timeout: NAVIGATION_TIMEOUT_MS })
    await page.waitForSelector('#root .choose-budget', { timeout: NAVIGATION_TIMEOUT_MS })

    const pageText = await page.$eval('#root', (el) => el.textContent || '')

    expect(pageText).toContain('Compare')
    expect(pageText).toContain('Show changes as:')
    expect(pageText).toContain('Budget breakdowns')
    expect(pageText).toContain('Spending by Department')
    expect(pageText).toContain('Revenue by Category')
  })

  test('has no WCAG A/AA accessibility violations', async () => {
    await page.goto(`${BASE_URL}/compare/`, { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT_MS })

    await page.waitForSelector('#root h1', { timeout: NAVIGATION_TIMEOUT_MS })
    await page.addScriptTag({ path: axeSourcePath })

    const axeResults = await page.evaluate(() => {
      const appRoot = document.querySelector('#root')
      if (!appRoot) {
        throw new Error('Missing #root container for accessibility scan.')
      }

      return window.axe.run(appRoot, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21aa']
        },
        rules: {
          // CI rendering differences can make this rule non-deterministic in headless Chromium.
          'color-contrast': { enabled: false }
        }
      })
    })

    if (axeResults.violations.length > 0) {
      throw new Error(`Accessibility violations detected:\n${formatA11yViolations(axeResults.violations)}`)
    }

    expect(axeResults.violations).toHaveLength(0)
  })

  test('loads usable constrained mode on iPhone 6 + 3G + limited CPU and RAM', async () => {
    const client = await page.target().createCDPSession()
    const defaultUserAgent = await browser.userAgent()
    try {
      await page.setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 12_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1'
      )
      await page.setViewport(IPHONE_6_VIEWPORT)
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(Navigator.prototype, 'deviceMemory', {
          configurable: true,
          get: () => 1
        })
      })
      await client.send('Network.enable')
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 400,
        downloadThroughput: 93750,
        uploadThroughput: 31250,
        connectionType: 'cellular3g'
      })
      await client.send('Emulation.setCPUThrottlingRate', { rate: 4 })

      const startTime = Date.now()
      await page.goto(`${BASE_URL}/compare/`, { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT_MS })
      await page.waitForSelector('#root h1', { timeout: NAVIGATION_TIMEOUT_MS })
      const elapsedMs = Date.now() - startTime

      const pageText = await page.$eval('#root', (el) => el.textContent || '')
      expect(pageText).toContain('Low-bandwidth mode is on to reduce data and battery use.')
      expect(pageText).toContain('Compare')
      expect(pageText).toContain('Budget breakdowns')

      await page.waitForSelector('#root table tbody tr', { timeout: NAVIGATION_TIMEOUT_MS })
      const rowCount = await page.$$eval('#root table tbody tr', (rows) => rows.length)
      const rowChartCount = await page.$$eval(
        '#root table tbody tr canvas',
        (canvasEls) => canvasEls.length
      )
      expect(rowCount).toBeGreaterThan(0)
      expect(rowCount).toBeLessThanOrEqual(20)
      expect(rowChartCount).toBe(0)
      expect(elapsedMs).toBeLessThan(NAVIGATION_TIMEOUT_MS)
    } finally {
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 0,
        downloadThroughput: -1,
        uploadThroughput: -1,
        connectionType: 'none'
      })
      await client.send('Emulation.setCPUThrottlingRate', { rate: 1 })
      await page.setViewport({ width: 1400, height: 900 })
      await page.setUserAgent(defaultUserAgent)
    }
  })
})
