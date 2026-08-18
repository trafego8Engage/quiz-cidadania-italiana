// Gera wordpress-embed/quiz-embed.html: um bundle único e auto-contido
// (CSS isolado sob #gc-quiz-app + logo em base64 + JS inline) pronto pra
// colar num bloco "HTML personalizado" (Gutenberg) ou widget "HTML" (Elementor)
// do WordPress. Rode `node wordpress-embed/build.js` sempre que index.html,
// styles.css ou app.js do quiz mudarem, pra manter o embed sincronizado.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCOPE = '#gc-quiz-app';

// ---------- 1) Escopa o CSS sob #gc-quiz-app ----------
let css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');

css = css.replace(/\/\*[\s\S]*?\*\//g, '');

const rootMatch = css.match(/:root\{([\s\S]*?)\}\n/);
const rootVars = rootMatch[1];
css = css.replace(rootMatch[0], '');

const htmlBodyMatch = css.match(/html,body\{([\s\S]*?)\}\n/);
const htmlBodyDecls = htmlBodyMatch[1]
  .replace(/margin:0;?/, '')
  .replace(/min-height:100%;?/, 'min-height:100vh;');
css = css.replace(htmlBodyMatch[0], '');

const containerBlock = `${SCOPE}{${rootVars}\n${htmlBodyDecls}\nbox-sizing:border-box}\n`;

// keyframe genérica "spin" -> nome único (evita colisão com o tema do WordPress)
css = css.replace(/@keyframes spin\{/, '@keyframes gcQuizSpin{');
css = css.replace(/animation:spin /, 'animation:gcQuizSpin ');

function prefixSelectorList(selectorList) {
  return selectorList
    .split(',')
    .map(s => s.trim())
    .map(s => (s.startsWith(SCOPE) ? s : `${SCOPE} ${s}`))
    .join(', ');
}

function findBlockEnd(text, start) {
  let depth = 1, j = start;
  while (depth > 0 && j < text.length) {
    if (text[j] === '{') depth++;
    else if (text[j] === '}') depth--;
    j++;
  }
  return j;
}

function processRuleBlock(text) {
  let out = '';
  let i = 0;
  while (i < text.length) {
    const atMediaMatch = text.slice(i).match(/^\s*@media([^{]*)\{/);
    if (atMediaMatch) {
      const start = i + atMediaMatch[0].length;
      const end = findBlockEnd(text, start);
      const inner = text.slice(start, end - 1);
      out += `\n@media${atMediaMatch[1]}{\n${processRuleBlock(inner)}}\n`;
      i = end;
      continue;
    }
    // @keyframes passa direto: to/from/50% não são seletores de elemento reais
    const atKeyframesMatch = text.slice(i).match(/^\s*@keyframes\s+([\w-]+)\s*\{/);
    if (atKeyframesMatch) {
      const start = i + atKeyframesMatch[0].length;
      const end = findBlockEnd(text, start);
      const inner = text.slice(start, end - 1);
      out += `\n@keyframes ${atKeyframesMatch[1]}{${inner}}\n`;
      i = end;
      continue;
    }
    const ruleMatch = text.slice(i).match(/^\s*([^{}]+)\{([^{}]*)\}/);
    if (ruleMatch) {
      const selector = ruleMatch[1].trim();
      const decls = ruleMatch[2];
      out += `${prefixSelectorList(selector)}{${decls}}\n`;
      i += ruleMatch[0].length;
      continue;
    }
    i++;
  }
  return out;
}

const finalCss = containerBlock + '\n' + processRuleBlock(css);

// ---------- 2) Logo em base64 (evita depender da Biblioteca de Mídia do WP) ----------
const logoBuf = fs.readFileSync(path.join(ROOT, 'logo.png'));
const logoDataUri = `data:image/png;base64,${logoBuf.toString('base64')}`;

// ---------- 3) Recorta o <main>...</main> do index.html ----------
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const mainMatch = indexHtml.match(/<main class="page-shell">[\s\S]*?<\/main>/);
const mainMarkup = mainMatch[0].replace(/src="logo\.png"/g, `src="${logoDataUri}"`);

// ---------- 4) JS (app.js na íntegra, sem alterações) ----------
const appJs = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');

// ---------- 5) Monta o bundle final ----------
// data-no-optimize/data-cfasync/data-rocket-no-defer: o WP Rocket (ativo no
// site de produção) reescreve <script> pra type="text/rocketlazyloadscript"
// e só executa após interação do usuário — isso quebra o render() inicial
// do quiz (fica travado no Passo 1, sem título/opções). Esses atributos
// pedem pro WP Rocket ignorar este script.
const bundle = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600&display=swap" rel="stylesheet">

<style>
${finalCss}
</style>

<div id="gc-quiz-app">
${mainMarkup}
</div>

<script data-no-optimize="1" data-cfasync="false" data-rocket-no-defer>
${appJs}
</script>
`;

const outPath = path.join(__dirname, 'quiz-embed.html');
fs.writeFileSync(outPath, bundle, 'utf8');
console.log('Bundle gerado em', outPath, '-', bundle.length, 'bytes');
