const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const file = process.argv[2];
const outDir = process.argv[3];
fs.mkdirSync(outDir, { recursive: true });
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }).catch(() => chromium.launch({ args: ['--no-sandbox'] }));
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('file://' + path.resolve(file));
  await page.waitForTimeout(500);
  const info = await page.evaluate(() => ({
    skins: __api.SKINS.map(s => s.id), hats: __api.HATS.map(h => h.id), boots: __api.BOOTS.map(b => b.id),
    accs: __api.ACCESSORIES.map(a => a.id), balls: __api.BALLS.map(b => b.id)
  }));
  // Render one tile per cosmetic at preview scale (2x of 160px) using the game's own draw functions.
  const tiles = await page.evaluate(() => {
    const out = {};
    const mk = () => { const c = document.createElement('canvas'); c.width = 320; c.height = 320; return c; };
    const base = (g, P, skin, hat, boots, acc, t) => {
      g.setTransform(2, 0, 0, 2, 0, 0);
      g.clearRect(0, 0, 160, 160);
      g.fillStyle = 'rgba(0,0,0,0.3)';
      g.beginPath(); g.ellipse(80, 102 + 32 * 1.7 + 2, 30, 4, 0, 0, Math.PI * 2); g.fill();
      __api.drawPlayer(g, P, skin, hat, boots, acc, null, t);
    };
    const P = () => ({ x: 80, y: 102, radius: 32, angle: 0, chargeAmount: 0, maxCharge: 60, playerNum: 1 });
    const label = (c) => c;
    out.skins = __api.SKINS.map((s, i) => { const c = mk(); const g = c.getContext('2d'); base(g, P(), i, 0, 0, 0, 500); return c.toDataURL(); });
    out.hats = __api.HATS.map((h, i) => { const c = mk(); const g = c.getContext('2d'); base(g, P(), 0, i, 0, 0, 500); return c.toDataURL(); });
    out.boots = __api.BOOTS.map((b, i) => { const c = mk(); const g = c.getContext('2d'); base(g, P(), 0, 0, i, 0, 500); return c.toDataURL(); });
    out.accs = __api.ACCESSORIES.map((a, i) => { const c = mk(); const g = c.getContext('2d'); base(g, P(), 0, 0, 0, i, 500); return c.toDataURL(); });
    out.balls = __api.BALLS.map((b, i) => { const c = mk(); const g = c.getContext('2d'); g.setTransform(2, 0, 0, 2, 0, 0); g.clearRect(0, 0, 160, 160); __api.drawBall(g, { x: 80, y: 80, radius: 36, spin: 0.4 }, i); return c.toDataURL(); });
    return out;
  });
  const save = (dir, name, url) => fs.writeFileSync(path.join(outDir, dir, name), Buffer.from(url.split(',')[1], 'base64'));
  for (const k of Object.keys(tiles)) {
    fs.mkdirSync(path.join(outDir, k), { recursive: true });
    const ids = k === 'skins' ? info.skins : k === 'hats' ? info.hats : k === 'boots' ? info.boots : k === 'accs' ? info.accs : info.balls;
    tiles[k].forEach((u, i) => save(k, String(i).padStart(2, '0') + '_' + ids[i] + '.png', u));
  }
  // Contact sheets (one per category) built in-page for review.
  for (const k of Object.keys(tiles)) {
    const ids = k === 'skins' ? info.skins : k === 'hats' ? info.hats : k === 'boots' ? info.boots : k === 'accs' ? info.accs : info.balls;
    const sheet = await page.evaluate(async ({ urls, ids }) => {
      const cols = 6, cell = 160, pad = 10, rows = Math.ceil(urls.length / cols);
      const c = document.createElement('canvas');
      c.width = cols * cell; c.height = rows * (cell + 20);
      const g = c.getContext('2d');
      g.fillStyle = '#1e272e'; g.fillRect(0, 0, c.width, c.height);
      g.font = '12px sans-serif'; g.fillStyle = '#fff'; g.textAlign = 'center';
      const imgs = await Promise.all(urls.map(u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = u; })));
      imgs.forEach((im, i) => {
        const x = (i % cols) * cell, y = Math.floor(i / cols) * (cell + 20);
        g.drawImage(im, x, y, cell, cell);
        g.fillText(i + ' ' + ids[i], x + cell / 2, y + cell + 14);
      });
      return c.toDataURL();
    }, { urls: tiles[k], ids });
    fs.writeFileSync(path.join(outDir, `sheet_${k}.png`), Buffer.from(sheet.split(',')[1], 'base64'));
  }
  fs.writeFileSync(path.join(outDir, 'ids.json'), JSON.stringify(info, null, 2));
  console.log(JSON.stringify({ counts: Object.fromEntries(Object.entries(info).map(([k, v]) => [k, v.length])), errors }, null, 2));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
