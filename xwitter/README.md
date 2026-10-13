# Xwitter — rede social de mensagens curtas

Projeto da disciplina de desenvolvimento de sistemas do COLTEC/UFMG. Visual original coral/marinho, servidor Node.js + Express, páginas EJS, Sequelize + SQLite, Bootstrap, D3 e p5. Suporta apresentação, cadastro/login, feed geral e seguindo, perfil, conversas, respostas, curtidas, seguimento, busca e indicadores do usuário.

## Iniciar (Node.js 24)

```bash
cd xwitter
npm install
cp .env.example .env
# editar SESSION_SECRET com um valor longo e aleatório
npm run migrate
npm run seed
npm start
```

Abra http://localhost:3000. Os dados de demonstração usam contas fictícias, por exemplo `ana@exemplo.test` e a senha de teste `Senha-Exemplo-Ana-2026!` (não use em ambiente real). O banco `data/xwitter.sqlite` não é versionado. Caso queira começar sem dados fictícios, não rode o seed.

## Testar

```bash
npx playwright install chromium
npm test
```

O Playwright prepara seu próprio banco `data/xwitter.test.db` e abre a aplicação na porta 3001. Não rode o `test:seed` em um banco que contenha dados valiosos. O servidor da aplicação não precisa estar rodando para `npm test`.

## Organização e decisões

- `src/db.js`: quatro entidades e associações. Curtidas e seguidores possuem índices únicos. Textos são contados em grafemas.
- `src/app.js`: sessão com store SQLite, bcrypt, CSRF, rate limit, rotas, autorização, invalidadores e indicadores.
- `src/migrate.js`: instalação inicial do esquema Sequelize. Para upgrades, recomenda-se versionar cada mudança de esquema.
- `src/seed.js`: Ana, Bruno, Carla, Diego e Elisa; cinco publicações, duas respostas, sete curtidas.
- `views/`: templates EJS com escape; `public/`: identidade SVG e quatro avatares originais por CSS, D3, p5 e temas.
- `tests/`: E2E Playwright. `docs/`: planejamento, contratos e decisões.
- `.github/agents/`: prompts de quatro agentes do Copilot (arquitetura, backend, interface e QA).
- `.vscode/mcp.json`: dois servidores MCP locais (Playwright e DBHub), executados pelo npm da pasta do projeto. Para DBHub, inicie antes `npm run test:seed` e ajuste `DB_PATH` se necessário.

## Regras principais

Publicações principais têm até 280 grafemas; respostas de um nível. Excluir a publicação principal remove a conversa inteira. O feed tem páginas de dez itens e critério de desempate pelo ID. Curtidas/seguimentos são operações idempotentes, com unicidade SQL; o autor vem da sessão, nunca do formulário. Hashtags são normalizadas para minúsculas. Indicadores: fuso UTC e dias sem posts com zero. O cache em RAM dura 30 segundos, admite 100 entradas e limite agregado aproximado de 10 MiB; é invalidado após mutações. Não há mensagens privadas nem persistência sensível no navegador.

## Segurança

Em produção: configurar `NODE_ENV=production`, `SESSION_SECRET` de pelo menos 32 caracteres, HTTPS e proxy reverso corretamente ajustado. Não publicar `.env`, banco SQLite, cookies, hashes ou resultados privados de testes.

## Nota sobre evidências

Arquivos de agentes e configuração MCP não provam seu uso. Registre as sessões e chamadas reais no VS Code durante a apresentação da atividade. A execução dos testes deve ser comprovada pelos logs do terminal ou GitHub Actions; não confunda testes escritos com testes aprovados.
