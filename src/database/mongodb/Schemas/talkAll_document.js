const { model, Schema } = require('mongoose')

const talkAll_document = new Schema({
	all: [{
		who_id: {
			type: Number,
			required: true,
			min: 1
		},
		name: String,
    image: String,
    msg: String
	}]
}, {
	timestamps: true
})

module.exports = model('talk_all_document', talkAll_document)
