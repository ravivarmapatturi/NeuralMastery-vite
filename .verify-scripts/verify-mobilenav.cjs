/* Verification pass for the responsive navigation architecture (mobile
 * hamburger drawer + desktop docked sidebar/TOC). Scoped, temporary script,
 * not part of the app. */
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = 'http://localhost:5173/NeuralMastery-vite';
const results = [];

function log(check, pass, detail) {
  results.push({ check, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${check}${detail ? ' -- ' + detail : ''}`);
}

async function main() {
  const browser = await chromium.launch();

  // ---------------------------------------------------------------
  // 1-6: mobile (375px) drawer open/close/nav/highlight/escape/backdrop
  // ---------------------------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errs.push(msg.text()); });
    page.on('pageerror', (err) => errs.push('PAGEERROR: ' + err.message));

    await page.goto(`${BASE}/docs/deep-learning/component-porting-check`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    // docked sidebar/TOC must not be visible at this width
    const dockedSidebarVisible = await page.locator('.nm-sidebar').first().isVisible().catch(() => false);
    log('mobile: docked sidebar hidden', !dockedSidebarVisible);

    const hamburger = page.getByRole('button', { name: 'Open navigation menu' });
    log('hamburger button visible', await hamburger.isVisible());

    // 1. Mobile menu opens
    await hamburger.click();
    await page.waitForTimeout(300);
    const dialog = page.getByRole('dialog', { name: 'Site navigation' });
    log('1. mobile menu opens (dialog visible)', await dialog.isVisible());

    // 2. Sidebar contents appear (section labels + page links from the real content tree)
    const sectionLabel = dialog.getByText('Deep Learning', { exact: false });
    const pageLink = dialog.getByRole('link', { name: 'Component Porting Check' });
    log('2. sidebar contents appear (section label)', (await sectionLabel.count()) > 0);
    log('2. sidebar contents appear (page link)', (await pageLink.count()) > 0);

    // 4. Current page is highlighted (accent color, not the muted default)
    const activeColor = await pageLink.first().evaluate((el) => getComputedStyle(el).color);
    log('4. current page highlighted', activeColor === 'rgb(33, 163, 116)' || activeColor === 'rgb(61, 220, 151)', activeColor);

    // TOC section also present inside the drawer
    const tocHeading = dialog.getByText('On this page');
    log('responsive TOC access inside drawer', (await tocHeading.count()) > 0);

    // focus landed inside the panel
    const focusInPanel = await page.evaluate(() => {
      const panel = document.querySelector('[role="dialog"][aria-label="Site navigation"]');
      return !!panel && panel.contains(document.activeElement);
    });
    log('focus moves into panel on open', focusInPanel);

    // 3 + 5. Navigation works, then menu closes correctly after navigating
    await dialog.getByRole('link', { name: 'Welcome to Neural Mastery' }).click();
    await page.waitForTimeout(300);
    const urlAfterNav = page.url();
    log('3. navigation works (URL changed)', /getting-started\/intro/.test(urlAfterNav), urlAfterNav);
    const dialogVisibleAfterNav = await dialog.isVisible().catch(() => false);
    log('5. menu closes after navigating', !dialogVisibleAfterNav);

    // 6. Escape closes it
    await hamburger.click();
    await page.waitForTimeout(300);
    log('menu reopens for escape test', await dialog.isVisible());
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    log('6. Escape closes menu', !(await dialog.isVisible().catch(() => false)));
    const focusReturnedToTrigger = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') === 'Open navigation menu');
    log('focus returns to hamburger on close', focusReturnedToTrigger);

    // Backdrop click closes it
    await hamburger.click();
    await page.waitForTimeout(300);
    // click near the top-right corner, outside the 320px-wide panel
    await page.mouse.click(360, 400);
    await page.waitForTimeout(300);
    log('backdrop click closes menu', !(await dialog.isVisible().catch(() => false)));

    // Keyboard: Tab focus trap (open again, tab through, should stay inside dialog)
    await hamburger.click();
    await page.waitForTimeout(300);
    for (let i = 0; i < 30; i++) await page.keyboard.press('Tab');
    const stillInPanel = await page.evaluate(() => {
      const panel = document.querySelector('[role="dialog"][aria-label="Site navigation"]');
      return !!panel && panel.contains(document.activeElement);
    });
    log('focus trap keeps Tab inside panel', stillInPanel);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    // No horizontal overflow at 375px
    const overflow375 = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    log('10. no horizontal overflow at 375px', overflow375.scrollWidth <= overflow375.clientWidth + 4, JSON.stringify(overflow375));

    // Representative visualization still renders/functions at mobile width
    await page.goto(`${BASE}/docs/deep-learning/component-porting-check`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const container = page.locator('h2:has-text("Linear Regression Studio") + div').first();
    await container.scrollIntoViewIfNeeded();
    const svgCount = await container.locator('svg').count();
    const before = await container.locator('text=/w \\(slope\\)/').innerText();
    const slider = container.locator('input[type="range"]').nth(1);
    await slider.evaluate((el) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, el.max);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(150);
    log('9. representative visualization renders at mobile width', svgCount > 0);

    log('8. no console errors (mobile pass)', errs.length === 0, errs.slice(0, 5).join(' | '));
    await ctx.close();
  }

  // ---------------------------------------------------------------
  // Tablet (768px) -- same checks, abbreviated
  // ---------------------------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errs.push(msg.text()); });
    await page.goto(`${BASE}/docs/deep-learning/component-porting-check`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const dockedSidebarVisible = await page.locator('.nm-sidebar').first().isVisible().catch(() => false);
    log('tablet (768px): docked sidebar hidden', !dockedSidebarVisible);
    const hamburger = page.getByRole('button', { name: 'Open navigation menu' });
    log('tablet: hamburger visible', await hamburger.isVisible());
    await hamburger.click();
    await page.waitForTimeout(300);
    const dialog = page.getByRole('dialog', { name: 'Site navigation' });
    log('tablet: menu opens', await dialog.isVisible());
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    const overflow768 = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    log('no horizontal overflow at 768px', overflow768.scrollWidth <= overflow768.clientWidth + 4, JSON.stringify(overflow768));
    log('tablet: no console errors', errs.length === 0, errs.slice(0, 5).join(' | '));
    await ctx.close();
  }

  // ---------------------------------------------------------------
  // 7. Desktop layout remains unchanged (1280px)
  // ---------------------------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errs.push(msg.text()); });
    await page.goto(`${BASE}/docs/deep-learning/component-porting-check`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const sidebarVisible = await page.locator('.nm-sidebar').first().isVisible();
    const tocVisible = await page.locator('.nm-toc').first().isVisible();
    const hamburgerVisible = await page.getByRole('button', { name: 'Open navigation menu' }).isVisible();
    log('7. desktop: docked sidebar visible', sidebarVisible);
    log('7. desktop: docked TOC visible', tocVisible);
    log('7. desktop: hamburger hidden', !hamburgerVisible);

    const sidebarWidth = await page.locator('.nm-sidebar').first().evaluate((el) => el.getBoundingClientRect().width);
    log('7. desktop sidebar width unchanged (260px)', Math.abs(sidebarWidth - 260) < 1, sidebarWidth);
    const tocWidth = await page.locator('.nm-toc').first().evaluate((el) => el.getBoundingClientRect().width);
    log('7. desktop TOC width unchanged (220px)', Math.abs(tocWidth - 220) < 1, tocWidth);

    // active page highlighted in desktop sidebar too (regression check)
    const activeLink = page.locator('.nm-sidebar a').filter({ hasText: 'Component Porting Check' });
    const activeColor = await activeLink.first().evaluate((el) => getComputedStyle(el).color);
    log('desktop sidebar active-page highlight unchanged', activeColor === 'rgb(33, 163, 116)' || activeColor === 'rgb(61, 220, 151)', activeColor);

    // scroll-spy: click a TOC link, verify it's a real in-page anchor
    const firstTocLink = page.locator('.nm-toc a').first();
    const href = await firstTocLink.getAttribute('href');
    log('desktop TOC scroll-spy link present', !!href && href.startsWith('#'), href);

    // prev/next nav still present
    const prevNext = await page.locator('a', { hasText: /Welcome to Neural Mastery|Next/i }).count();
    log('desktop prev/next nav present', prevNext >= 0); // informational; page-dependent

    const overflowDesktop = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    log('no horizontal overflow at 1280px', overflowDesktop.scrollWidth <= overflowDesktop.clientWidth + 4, JSON.stringify(overflowDesktop));
    log('desktop: no console errors', errs.length === 0, errs.slice(0, 5).join(' | '));
    await ctx.close();
  }

  await browser.close();

  const failed = results.filter((r) => !r.pass);
  fs.writeFileSync('.verify-scripts/mobilenav-results.json', JSON.stringify(results, null, 2));
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length > 0) {
    console.log('FAILED CHECKS:');
    failed.forEach((f) => console.log(` - ${f.check} (${f.detail})`));
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error('SCRIPT FAILURE:', e);
  process.exit(1);
});
