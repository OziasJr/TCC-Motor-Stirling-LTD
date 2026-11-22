// Confere se todos os arquivos locais referenciados pelo index.html existem, com a MESMA caixa
// (maiúsculas/minúsculas) usada no HTML. O Windows ignora a caixa; o Linux do Netlify, não.
// Também avisa se alguma referência aponta para node_modules (o Netlify não publica essa pasta).
//
// Uso: npm run check
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// comentários HTML (ex.: <img> desativado) não são referências reais
const html = readFileSync(join(root, "index.html"), "utf8").replace(/<!--[\s\S]*?-->/g, "");

// 1) atributos src/href de tags HTML; 2) caminhos "./..." ou "/..." escritos em strings do JavaScript (ex.: new Audio("./effect/x.mp3"))
const refs = new Set();
for (const m of html.matchAll(/\b(?:src|href)\s*=\s*"([^"]+)"/g)) refs.add(m[1]);
for (const m of html.matchAll(/["'`](\.{0,2}\/[\w@%\-.\/ ]+\.[a-z0-9]{2,5})["'`]/gi)) refs.add(m[1]);

const isExternal = (r) => /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(r);
const problems = [];
let checked = 0;

// confere cada segmento do caminho contra o nome real no disco (sensível a maiúsculas/minúsculas)
function existsExact(relPath) {
  let dir = root;
  for (const part of relPath.split("/").filter(Boolean)) {
    if (!existsSync(dir) || !readdirSync(dir).includes(part)) return false;
    dir = join(dir, part);
  }
  return true;
}

for (const raw of [...refs].sort()) {
  if (isExternal(raw)) continue;
  const clean = raw.split(/[?#]/)[0];
  if (!clean) continue;
  const rel = clean.replace(/^\.\//, "").replace(/^\//, "");
  checked++;
  if (/(^|\/)node_modules\//.test(rel)) problems.push(`aponta para node_modules (não é publicado no Netlify): ${raw}`);
  else if (!existsExact(rel)) problems.push(`arquivo inexistente ou com caixa diferente: ${raw}`);
}

console.log(`${checked} referências locais conferidas em index.html.`);
if (problems.length) {
  console.error("PROBLEMAS:\n  - " + problems.join("\n  - "));
  process.exit(1);
}
console.log("OK: todos os arquivos existem, com a caixa exata, e nenhum depende de node_modules.");
