const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1100 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('http://localhost:4177/NeuralMastery-vite/docs/machine-learning/linear-regression', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('article.prose');
  await page.waitForTimeout(500);
  console.log('svg count:', await page.locator('article.prose svg').count());
  console.log('page errors:', errors.length ? errors : 'NONE');

  await page.screenshot({ path: '.verify-scripts/lr-top.png' });

  const el2 = page.getByText('Study hours vs', { exact: false }).first();
  const c2 = await el2.count();
  const anchor2 = c2 ? el2 : page.getByText('You already know the equation', { exact: false }).first();
  await anchor2.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await page.screenshot({ path: '.verify-scripts/lr-scatter.png' });

  const el3 = page.getByText('The full loop', { exact: false }).first();
  await el3.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await page.screenshot({ path: '.verify-scripts/lr-loop.png' });

  const el4 = page.getByText('7. Closed-Form vs', { exact: false }).first();
  await el4.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await page.screenshot({ path: '.verify-scripts/lr-twopaths.png' });

  const el5 = page.getByText('How to actually check these', { exact: false }).first();
  await el5.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await page.screenshot({ path: '.verify-scripts/lr-residual.png' });

  await browser.close();
})();
