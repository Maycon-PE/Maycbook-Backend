const fs = require('fs')
const { resolve } = require('path')

const middleware = require('./middleware')

module.exports = app => {
	app.use('/auth', middleware)

	app.get('/rollback', (req, res) => {
		req.mysql.migrate.rollback()

		res.send('rollback')
	})

	try {
		fs
			.readdirSync(resolve(__dirname, 'endpointers'))
			.forEach(file => require( resolve(__dirname, 'endpointers', file) )(app) )
	} catch(e) {
		console.log('\x1b[31m%s\x1b[0m', 'Nenhuma rota')
	}
}
