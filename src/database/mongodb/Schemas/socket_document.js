const { model, schema } = require('mongoose')

const socket_document = new schema({
	sockets_id: [{
		user_id: Number,
		socket_id: String
	}]
})

module.exports = model('socket_document', socket_document)
