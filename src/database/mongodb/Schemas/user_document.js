const { Schema, model } = require('mongoose')

const user_document = new Schema({
	user_id: {
		type: Number,
		required: true,
		min: 1
	},
	posts: [Number],
	notifications: [{
		mode: String,
		who: Number,
		name: String,
		msg: String,
		image: String,
		date: String
	}],
	dialogues: [{
		who: Number,
		name: String,
		msg: String,
		image: String,
		date: String
	}]
}, {
	timestamps: true
})

module.exports = model('user_document', user_document)
