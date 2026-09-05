const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const url = 'http://localhost:4177/docs/deep-learning/attention-transformers';
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('article.prose');
  await page.waitForTimeout(400);

  // Check at scroll top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  const sidebarBtn = page.getByRole('button', { name: 'Hide sidebar' });
  const tocBtn = page.getByRole('button', { name: 'Hide table of contents' });
  let sBox = await sidebarBtn.boundingBox();
  let tBox = await tocBtn.boundingBox();
  console.log('AT SCROLL TOP:');
  console.log('  sidebar toggle box:', sBox, sBox && sBox.y >= 0 && sBox.y < 1080 ? 'VISIBLE IN VIEWPORT' : 'OFF SCREEN');
  console.log('  toc toggle box:', tBox, tBox && tBox.y >= 0 && tBox.y < 1080 ? 'VISIBLE IN VIEWPORT' : 'OFF SCREEN');

  // Scroll deep into page and re-check -- sticky should track viewport middle
  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  console.log('total page height:', pageHeight);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(300);
  sBox = await sidebarBtn.boundingBox();
  tBox = await tocBtn.boundingBox();
  console.log('AT MID-PAGE SCROLL:');
  console.log('  sidebar toggle box:', sBox, sBox && sBox.y >= 0 && sBox.y < 1080 ? 'VISIBLE IN VIEWPORT' : 'OFF SCREEN');
  console.log('  toc toggle box:', tBox, tBox && tBox.y >= 0 && tBox.y < 1080 ? 'VISIBLE IN VIEWPORT' : 'OFF SCREEN');

  // Click to collapse, verify it still works
  await sidebarBtn.click();
  await page.waitForTimeout(200);
  const sidebarGone = await page.locator('.nm-sidebar').count();
  console.log('sidebar element count after collapse click:', sidebarGone);
  const showBtn = page.getByRole('button', { name: 'Show sidebar' });
  console.log('show-sidebar button now present:', await showBtn.count());

  await tocBtn.click();
  await page.waitForTimeout(200);
  const tocGone = await page.locator('.nm-toc').count();
  console.log('toc element count after collapse click:', tocGone);

  await browser.close();
})();
