
exports.up = function(knex) {
 	return knex
 		.schema
 		.createTable('talk', table => {

 			table
 				.increments('id')
 				.primary()

 			// Chave estrangeira :  	

 			table
 				.integer('user_id')	
 				.unsigned()
 				.notNull()
 				.unique()

 			table	
 				.foreign('user_id')
 				.references('id')
 				.inTable('user')

 			// Referência à um documento no mongodb	:

 			table
 				.string('data')
 				.notNull()
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
  	.dropTableIfExists('talk')
}
