import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push('PAGE ERROR: ' + String(e)));
page.on('console', (msg) => { if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text()); });

await page.goto('https://neuralmasteryai.com/practice/dot-product');
await page.waitForSelector('h1');
await page.waitForSelector('.cm-content', { timeout: 15000 });
await page.screenshot({ path: '/tmp/real1-loaded.png' });

// Real, human-like typing: click into the editor, select-all+delete, then
// type line by line with REAL Enter presses (triggers CodeMirror's own
// auto-indent-on-Enter, exactly like a real person typing would).
await page.click('.cm-content');
await page.keyboard.press('Control+a');
await page.keyboard.press('Backspace');

const lines = [
  'def dot_product(a, b):',
  'if len(a) != len(b):',
  'raise ValueError("mismatched lengths")',
];
for (let i = 0; i < lines.length; i++) {
  await page.keyboard.type(lines[i], { delay: 30 });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(50);
}
// After the raise line, CodeMirror's auto-indent likely kept us at the
// `if` body's indent level -- a real user needs to dedent back out for
// the final `return` line, exactly like backspacing/shift-tab in a real
// editor.
await page.keyboard.press('Backspace');
await page.keyboard.type('return sum(x * y for x, y in zip(a, b))', { delay: 30 });

const finalCode = await page.locator('.cm-content').textContent();
console.log('Final code as typed by a "real user":', JSON.stringify(finalCode));
await page.screenshot({ path: '/tmp/real2-typed.png' });

console.log('Clicking Submit...');
const submitBtn = page.locator('button:has-text("Submit")');
console.log('Submit button visible:', await submitBtn.isVisible());
console.log('Submit button bounding box:', JSON.stringify(await submitBtn.boundingBox()));
await submitBtn.click();
await page.waitForTimeout(1000);
await page.screenshot({ path: '/tmp/real3-after-click.png' });

await page.waitForSelector('text=/passed|Submitted/i', { timeout: 30000 }).catch((e) => console.log('TIMEOUT waiting for result:', e.message));
await page.screenshot({ path: '/tmp/real4-final.png' });

console.log('Errors:', JSON.stringify(errors, null, 1));
await browser.close();
