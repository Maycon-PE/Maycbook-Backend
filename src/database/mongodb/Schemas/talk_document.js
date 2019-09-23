const { model, Schema } = require('mongoose')

const talk_document = new Schema({
	user_id: {
		type: Number,
		required: true,
		min: 1
	},
	private: [{
		who_id: Number,
		data: [{
			id: {
				type: Number,
				required: true,
				min: 1
			},
			msg: {
				type: String,
				required: true
			}
		}]
	}]
}, {
	timestamps: true
})

module.exports = model('talk_document', talk_document)
