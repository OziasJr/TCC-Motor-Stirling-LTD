// Copia para assets/vendor os arquivos das bibliotecas que o index.html usa em tempo de execução.
//
// Por quê: o Netlify não publica a pasta node_modules, então o HTML não pode apontar para ela.
// Os arquivos copiados ficam versionados no Git e são publicados junto com o site.
//
// Uso (na raiz do projeto):
//   npm ci            # instala as versões travadas em package-lock.json
//   npm run vendor    # copia os arquivos para assets/vendor e atualiza o README de versões
//   npm run check     # confere se tudo o que o index.html referencia existe
//
// Depois de rodar, abra o index.html, teste o simulador e faça o commit de assets/vendor.
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const nm = (...p) => join(root, "node_modules", ...p);
const vendor = (...p) => join(root, "assets", "vendor", ...p);

// [origem em node_modules, destino em assets/vendor]
const FILES = [
  [nm("bootstrap", "dist", "css", "bootstrap.min.css"), vendor("bootstrap", "css", "bootstrap.min.css")],
  [nm("bootstrap", "dist", "css", "bootstrap.min.css.map"), vendor("bootstrap", "css", "bootstrap.min.css.map")],
  [nm("bootstrap", "dist", "js", "bootstrap.bundle.min.js"), vendor("bootstrap", "js", "bootstrap.bundle.min.js")],
  [nm("bootstrap", "dist", "js", "bootstrap.bundle.min.js.map"), vendor("bootstrap", "js", "bootstrap.bundle.min.js.map")],
  [nm("bootstrap", "LICENSE"), vendor("bootstrap", "LICENSE")],
  [nm("highcharts", "highcharts.src.js"), vendor("highcharts", "highcharts.src.js")],
  [nm("highcharts", "modules", "accessibility.js"), vendor("highcharts", "modules", "accessibility.js")],
  [nm("highcharts", "modules", "exporting.src.js"), vendor("highcharts", "modules", "exporting.src.js")],
  [nm("highcharts", "LICENSE.txt"), vendor("highcharts", "LICENSE.txt")],
];

const missing = FILES.filter(([src]) => !existsSync(src));
if (missing.length) {
  console.error("Arquivos não encontrados em node_modules (rode `npm ci` antes):");
  for (const [src] of missing) console.error("  - " + src);
  process.exit(1);
}

const version = (pkg) => JSON.parse(readFileSync(nm(pkg, "package.json"), "utf8")).version;
for (const [src, dest] of FILES) {
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest);
}

const bootstrapVersion = version("bootstrap");
const highchartsVersion = version("highcharts");
const readme = vendor("README.md");
const text = `# Bibliotecas de terceiros (assets/vendor)

Cópias locais, versionadas no Git, das bibliotecas usadas pelo \`index.html\`.
O Netlify **não publica** a pasta \`node_modules\`; por isso o HTML aponta para esta pasta.

| Biblioteca | Versão | Arquivos usados |
|---|---|---|
| Bootstrap | ${bootstrapVersion} | \`bootstrap/css/bootstrap.min.css\`, \`bootstrap/js/bootstrap.bundle.min.js\` (já inclui o Popper) |
| Highcharts | ${highchartsVersion} | \`highcharts/highcharts.src.js\`, \`highcharts/modules/accessibility.js\`, \`highcharts/modules/exporting.src.js\` |

Os arquivos \`.map\` (mapas de código-fonte do Bootstrap) só são lidos com as ferramentas de desenvolvedor abertas.
O \`highcharts.css\` não é usado: ele serve ao modo "styled mode" do Highcharts, que este projeto não ativa.

## Como atualizar

\`\`\`
npm ci            # instala as versões travadas em package-lock.json
npm run vendor    # recopia os arquivos para esta pasta e atualiza esta tabela
npm run check     # confere as referências do index.html
\`\`\`

Depois teste o simulador (gráfico, menu de exportação, tooltips, menu Materiais, play/reload) e faça o commit.
`;
writeFileSync(readme, text, "utf8");

console.log(`Bootstrap ${bootstrapVersion} e Highcharts ${highchartsVersion} copiados para assets/vendor:`);
for (const [, dest] of FILES) console.log("  " + dest.slice(root.length + 1).replaceAll("\\", "/"));
