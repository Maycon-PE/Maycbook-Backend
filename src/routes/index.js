const fs = require('fs')
const { resolve } = require('path')

module.exports = app => {
	fs
		.readdirSync(resolve(__dirname, 'endpointers'))
		.forEach(folder => require( resolve(__dirname, 'endpointers', folder) )(app) )
}