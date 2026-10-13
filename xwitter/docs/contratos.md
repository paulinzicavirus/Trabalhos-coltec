# Contratos HTTP

Toda alteração usa POST com `_csrf` obtido de formulário autenticado ou público. A identidade vem de `req.session.uid`. No feed, `page` é inteiro positivo, `filtro=seguindo` solicita autores seguidos. Em `/explorar?q=`, a busca é limitada a 80 caracteres e consultas parametrizadas por Sequelize. `/atividade` devolve HTML privado com `X-Cache: HIT|MISS`.

Regras: publicações de até 280 grafemas; resposta somente a principal; curtidas e relações de seguir são idempotentes com restrição SQL; edição/exclusão condicionadas ao dono; segurança do HTML via escape automático do EJS.
