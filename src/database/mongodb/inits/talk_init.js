const Talk = require('../Schemas/talk_document')

function find(id) {
	return new Promise((resolve, reject) => {
		Talk.findOne({ user_id: id }, (err, Document) => {

			if (err) {

				init(id)
					.then(talk_document_id => resolve(talk_document_id))
					.catch(err => reject(err))

			} else {

				if (Document) {

					if (Document._id) {

						resolve(Document._id)

					} else {

						reject('Documento sem _id')

					}

				} else {

					init(id)
						.then(talk_document_id => resolve(talk_document_id))
						.catch(err => reject('Não achei e não conseguir criar'))

				}

			}

		})
	})
}

function init(id) {
	return new Promise((resolve, reject) => {
		Talk.create({ user_id: id }, (err, Document) => {
			console.log('talk - init ', Document)

			if (err) {
				// Não tentarei encontrar chanando a função 'find'

				reject(err)

			} else {

				if (Document) {

					if (Document._doc) {

						if (Document._doc._id) {

							resolve(Document._doc._id)

						} else {

							reject('Document sem _id')

						}

					}

				} else {

					reject('talk_document não criado')

				}

			}

		})
	})
}

module.exports = {

	find,

	init

}
