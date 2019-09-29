const { model, Schema } = require('mongoose')

const post_document = new Schema({
	user_id: {
		type: Number,
		required: true,
		min: 1
	},
	post_id: {
		type: Number,
		min: 1
	},
	date: String,
	data: {
		rate: {
			likes: [ {
				who: {
					type: Number,
					required: true,
					min: 1
				},
				name: String,
				image: String,
			}],
			deslikes: [{
				who: {
					type: Number,
					required: true,
					min: 1
				},
				name: String,
				image: String,
			}]
		},
		comments: [{
			who: {
				type: Number,
				required: true,
				min: 1
			},
			name: String,
			image: String,
			date: String,
			msg: String
		}]
	}
}, {
	timestamps: true
})

module.exports = model('post_document', post_document)
