const { model, Schema } = require('mongoose')

const talk_document = new Schema({
	user_id: {
		type: Number,
		required: true,
		min: 1
	},
	private: [{
		who_id: {
			type: Number,
			required: true,
			min: 1
		},
		initio: String,
		data: [{
			id: {
				type: Number,
				required: true,
				min: 1
			},
			msg: {
				type: String,
				required: true
			},
			date: String
		}]
	}]
}, {
	timestamps: true
})

module.exports = model('talk_document', talk_document)
