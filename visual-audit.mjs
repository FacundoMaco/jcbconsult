import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'visual-audit-output');
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'mobile',   width: 375,  height: 812  },
  { name: 'tablet',   width: 768,  height: 1024 },
  { name: 'desktop',  width: 1280, height: 900  },
  { name: 'wide',     width: 1440, height: 900  },
];

const SECTIONS = [
  { name: '01-hero',             selector: null,          scrollY: 0 },
  { name: '02-credibility',      selector: null,          scrollY: 700 },
  { name: '03-what-you-receive', selector: '#proceso',    scrollY: null },
  { name: '04-services',         selector: '#servicios',  scrollY: null },
  { name: '05-why-independent',  selector: null,          scrollY: null,  after: '#servicios' },
  { name: '06-clients',          selector: null,          scrollY: null,  after: '#servicios', offset: 200 },
  { name: '07-contact',          selector: '#contacto',   scrollY: null },
  { name: '08-full-page',        selector: null,          fullPage: true },
];

const issues = [];

async function audit() {
  const browser = await chromium.launch();
  console.log('🎭 Playwright visual audit iniciado\n');

  for (const vp of VIEWPORTS) {
    console.log(`📐 Viewport: ${vp.name} (${vp.width}×${vp.height})`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    // Capturar errores de consola
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    const vpDir = join(OUT, vp.name);
    mkdirSync(vpDir, { recursive: true });

    // Screenshot full page
    await page.screenshot({
      path: join(vpDir, '00-full-page.png'),
      fullPage: true,
    });

    // Screenshot viewport inicial (above the fold)
    await page.screenshot({
      path: join(vpDir, '01-above-fold.png'),
      fullPage: false,
    });

    // Screenshot sección hero
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(vpDir, '02-hero.png'), fullPage: false });

    // Scroll al punto de quiebre hero→credibility
    await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'instant' }));
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(vpDir, '03-hero-break.png'), fullPage: false });

    // Scroll a cada sección con ID
    for (const id of ['#proceso', '#servicios', '#contacto']) {
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }, id);
      await page.waitForTimeout(500);
      const safeName = id.replace('#', '');
      await page.screenshot({ path: join(vpDir, `04-${safeName}.png`), fullPage: false });
    }

    // ── CHECKS AUTOMÁTICOS ─────────────────────────────────────────────────

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    // 1. Overflow horizontal
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    if (hasHorizontalOverflow) {
      issues.push({ viewport: vp.name, type: 'overflow', msg: 'Horizontal overflow detectado en la página' });
      console.log(`  ⚠️  Horizontal overflow detectado`);
    }

    // 2. Texto demasiado pequeño (<11px) en elementos visibles
    const smallTextCount = await page.evaluate(() => {
      let count = 0;
      document.querySelectorAll('p, span, a, button, li').forEach(el => {
        const style = window.getComputedStyle(el);
        const size = parseFloat(style.fontSize);
        const text = el.textContent?.trim();
        if (size < 11 && size > 0 && text && text.length > 3 && style.display !== 'none' && style.visibility !== 'hidden') {
          count++;
        }
      });
      return count;
    });
    if (smallTextCount > 0) {
      issues.push({ viewport: vp.name, type: 'small-text', msg: `${smallTextCount} elemento(s) con font-size < 11px` });
      console.log(`  ⚠️  ${smallTextCount} texto(s) con font-size < 11px`);
    }

    // 3. Imágenes sin alt
    const imgsNoAlt = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).filter(img => !img.alt || img.alt.trim() === '').length;
    });
    if (imgsNoAlt > 0) {
      issues.push({ viewport: vp.name, type: 'img-alt', msg: `${imgsNoAlt} imagen(es) sin atributo alt` });
      console.log(`  ⚠️  ${imgsNoAlt} imagen(es) sin alt`);
    }

    // 4. Botones sin texto accesible
    const btnsNoLabel = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).filter(btn => {
        const text = btn.textContent?.trim();
        const aria = btn.getAttribute('aria-label');
        return (!text || text.length === 0) && !aria;
      }).length;
    });
    if (btnsNoLabel > 0) {
      issues.push({ viewport: vp.name, type: 'btn-a11y', msg: `${btnsNoLabel} botón(es) sin texto ni aria-label` });
      console.log(`  ⚠️  ${btnsNoLabel} botón(es) sin label accesible`);
    }

    // 5. Links rotos (href="#" o vacíos)
    const brokenLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).filter(a => {
        const href = a.getAttribute('href');
        return !href || href === '#';
      }).length;
    });
    if (brokenLinks > 0) {
      issues.push({ viewport: vp.name, type: 'broken-links', msg: `${brokenLinks} link(s) con href vacío o "#"` });
      console.log(`  ⚠️  ${brokenLinks} link(s) con href inválido`);
    }

    // 6. Errores de consola
    if (consoleErrors.length > 0) {
      issues.push({ viewport: vp.name, type: 'console-error', msg: consoleErrors.join(' | ') });
      console.log(`  ⚠️  Console errors: ${consoleErrors.length}`);
    }

    // 7. Elementos que se solapan con el navbar (sticky)
    const navbarHeight = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      return nav ? nav.getBoundingClientRect().height : 0;
    });

    // 8. Contraste básico — botones primarios
    const ctaBgColor = await page.evaluate(() => {
      const btn = document.querySelector('button.bg-brand-navy, button[class*="bg-brand-navy"]');
      if (!btn) return null;
      return window.getComputedStyle(btn).backgroundColor;
    });

    console.log(`  ✅ Screenshots guardados en visual-audit-output/${vp.name}/`);
    console.log(`  📏 Navbar height: ${Math.round(navbarHeight)}px`);

    await context.close();
  }

  await browser.close();

  // ── REPORTE FINAL ───────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  console.log('📋 REPORTE DE AUDITORÍA VISUAL');
  console.log('═'.repeat(60));

  if (issues.length === 0) {
    console.log('✅ Sin issues detectados automáticamente');
  } else {
    console.log(`\n⚠️  ${issues.length} issue(s) encontrado(s):\n`);
    const grouped = {};
    issues.forEach(i => {
      if (!grouped[i.type]) grouped[i.type] = [];
      grouped[i.type].push(`[${i.viewport}] ${i.msg}`);
    });
    Object.entries(grouped).forEach(([type, msgs]) => {
      console.log(`  ${type.toUpperCase()}:`);
      msgs.forEach(m => console.log(`    → ${m}`));
      console.log('');
    });
  }

  console.log(`\n📁 Screenshots guardados en: visual-audit-output/`);
  console.log('   mobile/   tablet/   desktop/   wide/');
  console.log('   (cada carpeta tiene full-page + secciones individuales)\n');
}

audit().catch(console.error);
