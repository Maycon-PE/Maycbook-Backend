
exports.up = function(knex) {
  return knex
    .schema
    .createTable('post', table => {

      table
        .increments('id')
        .primary()

      table
        .string('path')
        .notNull()

      table
        .string('content', 300)
        .notNull()

      // table
      //   .integer('likes')  
      //   .unsigned()
      //   .defaultTo(0)

      // table
      //   .integer('deslikes')  
      //   .unsigned()
      //   .defaultTo(0)

      // Chave estrangeira :  

      table
        .integer('user_id')
        .unsigned()
        .notNull()

      table
        .foreign('user_id')
        .references('id')
        .inTable('user')

      // Referência à um documento no mongodb :

      table
        .string('stats')
        .unique()

      table
        .timestamp('created_at', { precision: 6 })
        .defaultTo(knex.fn.now(6))

      table
        .timestamp('updated_at', { precision: 6 })
        .defaultTo(knex.fn.now(6))
    })
}

exports.down = function(knex) {
  return knex
    .schema
    .dropTableIfExists('post')
}
