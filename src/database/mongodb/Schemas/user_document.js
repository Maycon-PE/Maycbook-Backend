const { Schema, model } = require('mongoose')

const user_document = new Schema({
	user_id: {
		type: Number,
		required: true,
		min: 1
	},
	friends: [Number],
	posts: [Number],
	notifications: [{
		who: Number,
		name: String,
		msg: String,
		image: String
	}],
	invites: [{
		who: Number,
		name: String,
		image: String
	}],
	dialogues: [{
		who: Number,
		name: String,
		msg: String,
		image: String
	}]
}, {
	timestamps: true
})

module.exports = model('user_document', user_document)
