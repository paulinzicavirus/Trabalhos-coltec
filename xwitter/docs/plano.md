# Plano de arquitetura

- Páginas: apresentação, cadastro, login, feed geral/seguindo, perfil, publicação/conversa, explorar, atividade, configurações.
- Tabelas: User, Post, Like e Follow, com índices únicos em relações de curtida e seguimento.
- Segurança: sessão do servidor, hash de senha, CSRF, autorização, validação e escape HTML.
- UI: Bootstrap, temas claro/escuro, D3 em dois gráficos e p5 no login.
- Cache: RAM com TTL 30s e invalidação ao mutar dados.
- QA: banco isolado, Playwright e dois servidores MCP locais.

A validação real ainda está pendente.
