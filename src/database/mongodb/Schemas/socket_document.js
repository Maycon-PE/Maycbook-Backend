const { model, Schema } = require('mongoose')

const socket_document = new Schema({
	data: Object
})

module.exports = model('socket_document', socket_document)
