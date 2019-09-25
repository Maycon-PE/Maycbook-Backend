const User = require('../Schemas/user_document')

function find(id) {
	return new Promise((resolve, reject) => {
		User.findOne({ user_id: id }, (err, Document) => {

			if (err) {

				init(id)
					.then(user_document => resolve(user_document))
					.catch(err => reject(err))

			} else {

				if (Document) {

					resolve(Document)

				} else {

					init(id)
						.then(user_document => resolve(user_document))
						.catch(err => reject('Não achei e não conseguir criar'))

				}

			}

		})
	})
}

function init(id) {
	return new Promise((resolve, reject) => {
		User.create({ user_id: id }, (err, Document) => {

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

					reject('user_document não criado')

				}

			}

		})
	})
}

function update({ id, data }) {
	return new Promise((resolve, reject) => {
		User.updateOne({ user_id: id }, data, (err, Document) => {

			if (err) {

				reject('Erro na atualização')

			} else {

				if (Document) {

					if (Document.nModified) {

						resolve(Document)

					} else {

						reject('Nada auterado')

					}

				} else {

					reject('Não deu erro, mas não foi encontrado o documento')

				}

			}

		})
	})
}

module.exports = {

	find,

	init,

	update

}
