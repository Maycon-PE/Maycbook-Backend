
exports.up = function(knex) {
  return knex
    .schema
    .createTable('post', table => {
      table
        .increments('id')
        .primary()

      table
        .integer('author_id')
        .unsigned()
        .notNull()

      table
        .foreign('author_id')
        .references('id')
        .inTable('user')

      table
        .timestamp('created_at', { precision: 6 })
        .defaultTo(knex.fn.now(6))

      table
        .timestamp('updated_at', { precision: 6 })
        .defaultTo(knex.fn.now(6))
    })
};

exports.down = function(knex) {
  return knex
    .schema
    .dropTableIfExists('post')
};
