const Talk = require('../Schemas/talkAll_document')

function findUnique(where) {
	return new Promise(async (resolve, reject) => {
    const talk_document = await Talk.findOne({}, {}, { sort: { 'createdAt': -1 } })

		if (!talk_document) {

			init()
				.then(talk_document => resolve(talk_document))
				.catch(err => reject(err))

		} else {

			resolve(talk_document)

		}

	})
}

function init(where) {
	return new Promise((resolve, reject) => {
		Talk.create(where, (err, Document) => {

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

function update({ where, data }) {
	return new Promise((resolve, reject) => {
		Talk.updateOne(where, data, (err, result) => {

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

					reject('Descrição do resultado nulo')

				}

			}

		})
	})
}

module.exports = {

	findUnique,

	init,

	update

}
