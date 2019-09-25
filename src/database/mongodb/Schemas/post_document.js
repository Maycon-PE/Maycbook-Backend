const { model, Schema } = require('mongoose')

const post_document = new Schema({
	user_id: {
		type: Number,
		required: true,
		min: 1
	},
	post_id: {
		type: Number,
		required: true,
		min: 1
	},
	data: {
		rate: {
			likes: [ Number ],
			deslikes: [ Number ]
		},
		comments: [{
			who: {
				type: Number,
				required: true,
				min: 1
			},
			msg: String
		}]
	}
}, {
	timestamps: true
})

module.exports = model('post_document', post_document)
