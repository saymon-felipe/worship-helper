# worship-helper

Cliente web (Vue + Vite, Node >= 22) do aplicativo Worship Helper; API em `../worship-helper-api`, site em `../worship-helper-site`. Há `Dockerfile`. A API é definida por `VITE_API_URL`.

Scripts: `dev`, `build`, `preview` (porta 4173), `lint` (**com `--fix`**: altera arquivos).

## Regras comuns

- `.env*` nunca é lido, impresso nem commitado (nomes das variáveis: `.env.example`, quando existir).
- Sem `git push`/deploy sem pedido; commits com caminhos explícitos (nada de `git add .`).
- Os comandos citados vêm do `package.json` (quando o repo tem um) e **não foram executados** (`node`/`npm` fora do PATH nesta máquina). Confirme antes de afirmar que passam.
