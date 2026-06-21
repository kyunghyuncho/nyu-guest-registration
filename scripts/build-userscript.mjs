#!/usr/bin/env node
/**
 * Bundles index.html, style.css, and app.js into userscript.js and
 * NYU-Modern-Guest-Registration.user.js for Tampermonkey installation.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = '1.0';
const INSTALL_URL =
  'https://github.com/kyunghyuncho/nyu-guest-registration/raw/main/NYU-Modern-Guest-Registration.user.js';

function scopeCssForUserscript(css) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const blocks = [];
  let depth = 0;
  let current = '';

  for (const char of withoutComments) {
    current += char;
    if (char === '{') depth++;
    if (char === '}') {
      depth--;
      if (depth === 0) {
        blocks.push(current.trim());
        current = '';
      }
    }
  }

  return blocks.map((block) => {
    const splitIdx = block.indexOf('{');
    if (splitIdx === -1) return block;

    const selectorPart = block.slice(0, splitIdx).trim();
    const bodyPart = block.slice(splitIdx);

    if (
      selectorPart.startsWith('@import') ||
      selectorPart.startsWith('@keyframes') ||
      selectorPart === ':root'
    ) {
      return block;
    }

    const scopedSelectors = selectorPart
      .split(/,(?![^(]*\))/)
      .map((sel) => {
        const s = sel.trim().replace(/\s+/g, ' ');
        if (!s) return null;
        if (s === 'body') return '#modern-ui-root';
        if (s.startsWith('body.')) return s;
        if (s.startsWith('::-webkit-scrollbar')) return `.modern-ui-container ${s}`;
        // Portaled to document.body — must not be scoped under .modern-ui-container
        if (s === '.calendar-popup' || s.startsWith('.cal-')) return s;
        return `.modern-ui-container ${s}`;
      })
      .filter(Boolean)
      .join(',\n');

    return `${scopedSelectors} ${bodyPart}`;
  }).join('\n\n');
}

function extractHtmlBody() {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  const start = html.indexOf('<div class="modern-container">');
  const toastStart = html.indexOf('<div class="toast-container"');
  if (start === -1 || toastStart === -1) {
    throw new Error('Could not parse index.html structure for userscript bundle');
  }

  const dashboard = html.slice(start, toastStart).trim();
  const toastEnd = html.indexOf('</div>', toastStart) + '</div>'.length;
  const toast = html.slice(toastStart, toastEnd).trim();

  return `  <div class="modern-ui-container">\n    ${dashboard}\n\n    ${toast}\n  </div>`;
}

function extractAppLogic() {
  const app = readFileSync(join(ROOT, 'app.js'), 'utf8');
  const withoutHeader = app.replace(/^\/\*\*[\s\S]*?\*\/\s*/, '');
  const withoutStandaloneBootstrap = withoutHeader.replace(
    /\/\/ @standalone-bootstrap-start[\s\S]*?\/\/ @standalone-bootstrap-end\s*\n?/,
    ''
  );

  return `${withoutStandaloneBootstrap.trim()}\n\n    // Bootstrap (live portal)\n    state.isMockMode = false;\n    if (!state.sesstok) state.sesstok = window.__sesstok || '';\n    if (!state.pid) state.pid = window.__pid || '';\n    if (!state.uhash) state.uhash = window.__uhash || '';\n\n    initTheme();\n    initDatePickers();\n    loadLocalStorageData();\n    setupEventListeners();\n\n    fetchBuildings().then(() => syncVisitors());`;
}

function buildUserscript() {
  const css = scopeCssForUserscript(readFileSync(join(ROOT, 'style.css'), 'utf8'));
  const html = extractHtmlBody();
  const logic = extractAppLogic();

  return `// ==UserScript==
// @name         NYU Modern Guest Registration
// @namespace    http://tampermonkey.net/
// @version      ${VERSION}
// @description  A modern front-end overlay for the NYU visitor registration portal.
// @author       Kyunghyun Cho
// @updateURL    ${INSTALL_URL}
// @downloadURL  ${INSTALL_URL}
// @match        https://nyu.identigy.io/patron/VisitorManagement/VisitorsHost.php*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';
  const SCRIPT_VERSION = '${VERSION}';
  console.log(\`[NYU-ModernReg] v\${SCRIPT_VERSION} loaded\`);

  const cssStyles = \`
${css}
\`;

  const htmlTemplate = \`
${html}
  \`;

  function initInjection() {
    console.log('NYU Modern Guest UI Injector starting...');

    const uiRoot = document.createElement('div');
    uiRoot.id = 'modern-ui-root';
    uiRoot.innerHTML = htmlTemplate;

    const styleBlock = document.createElement('style');
    styleBlock.id = 'modern-ui-styles';
    styleBlock.textContent = cssStyles;
    document.head.appendChild(styleBlock);

    const originalBody = document.body;
    const bodyChildren = Array.from(originalBody.children);

    const hiddenWrapper = document.createElement('div');
    hiddenWrapper.id = 'original-identigy-content';
    hiddenWrapper.style.display = 'none';

    bodyChildren.forEach(child => {
      if (child !== styleBlock && child.tagName !== 'SCRIPT') {
        hiddenWrapper.appendChild(child);
      }
    });

    originalBody.appendChild(hiddenWrapper);
    originalBody.appendChild(uiRoot);

    originalBody.style.background = '#09050d';
    originalBody.style.margin = '0';
    originalBody.style.padding = '0';

    bindUILogic();
  }

  function bindUILogic() {
${logic.split('\n').map((line) => (line ? `    ${line}` : '')).join('\n')}
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initInjection();
  } else {
    window.addEventListener('DOMContentLoaded', initInjection);
  }
})();
`;
}

const output = buildUserscript();
writeFileSync(join(ROOT, 'userscript.js'), output);
writeFileSync(join(ROOT, 'NYU-Modern-Guest-Registration.user.js'), output);
console.log(`Built userscript v${VERSION} -> userscript.js, NYU-Modern-Guest-Registration.user.js`);
