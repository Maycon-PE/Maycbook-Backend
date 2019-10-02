const Post = require('../Schemas/post_document')

function find(where) {
	return new Promise((resolve, reject) => {
		Post.findOne(where, (err, Document) => {

			if (err) {

				init(where)
					.then(post_document => resolve(post_document))
					.catch(err => reject(err))

			} else {

				if (Document) {

					resolve(Document)

				} else {

					init(where)
						.then(post_document => resolve(post_document))
						.catch(err => reject('Não achei e não conseguir criar'))

				}

			}

		})
	})
}

function init(where) {
	return new Promise((resolve, reject) => {
		Post.create(where, (err, Document) => {

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

					reject('post_document não criado')

				}

			}

		})
	})
}

function aggregate(agg) {
	return new Promise((resolve, reject) => {
		Post.aggregate(agg, (err, Documents) => {

			!err ? resolve(Documents) : reject(err)
		})
	})
}

function update({ where, data }) {
	return new Promise((resolve, reject) => {
		Post.updateOne(where, data, (err, result) => {

			if (err) {

				reject('Erro na atualização')

			} else {

				if (result) {

					if (result.nModified) {

						resolve()

					} else {

						reject('Nada alterado')

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

	aggregate,

	update

}
