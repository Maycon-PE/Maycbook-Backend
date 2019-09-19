const db = require('./src/database/mysql/mysql_config')

module.exports = {
  client: 'mysql2',
  connection: db,
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }
}
