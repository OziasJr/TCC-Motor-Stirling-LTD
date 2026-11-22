# Bibliotecas de terceiros (assets/vendor)

Cópias locais, versionadas no Git, das bibliotecas usadas pelo `index.html`.
O Netlify **não publica** a pasta `node_modules`; por isso o HTML aponta para esta pasta.

| Biblioteca | Versão | Arquivos usados |
|---|---|---|
| Bootstrap | 5.3.8 | `bootstrap/css/bootstrap.min.css`, `bootstrap/js/bootstrap.bundle.min.js` (já inclui o Popper) |
| Highcharts | 12.5.0 | `highcharts/highcharts.src.js`, `highcharts/modules/accessibility.js`, `highcharts/modules/exporting.src.js` |

Os arquivos `.map` (mapas de código-fonte do Bootstrap) só são lidos com as ferramentas de desenvolvedor abertas.
O `highcharts.css` não é usado: ele serve ao modo "styled mode" do Highcharts, que este projeto não ativa.

## Como atualizar

```
npm ci            # instala as versões travadas em package-lock.json
npm run vendor    # recopia os arquivos para esta pasta e atualiza esta tabela
npm run check     # confere as referências do index.html
```

Depois teste o simulador (gráfico, menu de exportação, tooltips, menu Materiais, play/reload) e faça o commit.
