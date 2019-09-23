const { Schema, model } = require('mongoose')

const user_document = new Schema({
	user_id: {
		type: Number,
		required: true,
		min: 1
	},
	friends: [Number],
	posts: [Number]
}, {
	timestamps: true
})

module.exports = model('user_document', user_document)
