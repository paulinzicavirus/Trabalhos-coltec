import 'dotenv/config';
import { sequelize } from './db.js';
// Primeira migração de instalação: cria as tabelas definidas pelos modelos,
// sem modificar as já existentes. Alterações futuras: acrescentar migrações numeradas.
await sequelize.authenticate();
await sequelize.sync();
await sequelize.close();
console.log('Migração inicial aplicada.');
