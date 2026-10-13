# Plano inicial de arquitetura

## Escopo
Apresentação; autenticação; feed público e seguindo; perfil público; conversa de um nível; busca; configurações; atividade.

## Persistência
SQLite/Sequelize 6: User (handle e email únicos), Post (parentId opcional), Like (índice único UserId+PostId), Follow (índice único followerId+followingId). Autor obtido apenas da sessão. A criação inicial de tabelas usa `sync()`; migrações versionadas ainda são uma pendência.

## Contratos e decisões
GET /, /login, /cadastro, /feed, /perfil/:handle, /publicacao/:id, /explorar, /atividade, /configuracoes. POST /login, /cadastro, /sair, /publicar, /publicacao/:id/{curtir,descurtir,excluir}, /perfil/:id/{seguir,deixar-de-seguir}, /configuracoes. Todas as mutações exigem CSRF. Respostas não aparecem no feed principal e excluir um post principal remove suas respostas. Limite textual de 280 grafemas com Intl.Segmenter. A busca por hashtag não diferencia maiúsculas via consulta SQLite simples: normalização da análise é lowercase Unicode. Feed com 10 itens/página, desempate por id.

## Cache e gráficos
Cache de RAM de indicadores por id autenticado, 30s, até 100 entradas, invalidação por época para evitar uma consulta anterior preencher cache invalidado. Limite por item de 10MiB (o limite global exato de 10MiB ainda não é imposto). D3: barras por dia UTC na última semana e hashtags distintas por publicação.

## Visual e assets
Coral #f37465, marinho #111722, superfície #1a2230; variação clara; logo SVG original, ilustração SVG original, quatro avatares geométricos em CSS; p5 partículas leves com botão para pausar.

## Etapas e responsabilidade
Arquitetura -> backend -> interface -> QA -> integração; integração em sequência para evitar alterações simultâneas. Este pacote foi produzido neste atendimento; **não há evidência de execução real dos quatro agentes do Copilot/Antigravity nem de servidores MCP**, portanto esses critérios precisam ser realizados no VS Code.
