const Talk = require('../Schemas/talk_document')

function find(id) {
	return new Promise((resolve, reject) => {
		Talk.findOne({ user_id: id }, (err, Document) => {

			if (err) {

				init(id)
					.then(talk_document => resolve(talk_document))
					.catch(err => reject(err))

			} else {

				if (Document) {

					resolve(Document)

				} else {

					init(id)
						.then(talk_document => resolve(talk_document))
						.catch(err => reject('Não achei e não conseguir criar'))

				}

			}

		})
	})
}

function init(id) {
	return new Promise((resolve, reject) => {
		Talk.create({ user_id: id }, (err, Document) => {

			if (err) {
				// Não tentarei encontrar chamando a função 'find'

				reject(err)

			} else {

				if (Document) {

					if (Document._doc) {

						resolve(Document._doc)

					} else {

						reject('Documento nulo')

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
