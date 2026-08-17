import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('console', m => { if (['error','warning'].includes(m.type())) errors.push(m.type()+': '+m.text().slice(0,200)); });
page.on('pageerror', e => errors.push('page: '+e.message.slice(0,200)));
await page.goto('http://127.0.0.1:8080/', { waitUntil: 'networkidle', timeout: 45000 });
// wait until load overlay gone or 20s
for (let i = 0; i < 40; i++) {
  const vis = await page.evaluate(() => {
    const load = document.getElementById('load');
    const c = document.querySelector('canvas');
    const st = load ? getComputedStyle(load) : null;
    return {
      loadDisp: st?.display, loadOp: st?.opacity, loadVis: st?.visibility,
      hasCanvas: !!c, cw: c?.width, ch: c?.height,
      body: document.body?.innerText?.slice(0,120)
    };
  });
  console.log('tick', i, JSON.stringify(vis));
  if (vis.loadDisp === 'none' || vis.loadOp === '0') break;
  await page.waitForTimeout(500);
}
await page.screenshot({ path: '/workspace/screenshots/see-start.png', type: 'png' });
console.log('start shot');
const go = page.locator('#go');
if (await go.count()) {
  if (await page.locator('#nameIn').count()) await page.locator('#nameIn').fill('Grok');
  await go.click();
  try { await page.waitForSelector('#hud.on', { timeout: 20000 }); } catch(e) { console.log('no hud', e.message); }
  await page.waitForTimeout(800);
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(1400);
  await page.screenshot({ path: '/workspace/screenshots/see-right.png', type: 'png' });
  await page.keyboard.up('KeyD');
  await page.keyboard.down('KeyA');
  await page.waitForTimeout(1600);
  await page.screenshot({ path: '/workspace/screenshots/see-left.png', type: 'png' });
  await page.keyboard.up('KeyA');
}
console.log('errors', JSON.stringify(errors.slice(0,10)));
await browser.close();
