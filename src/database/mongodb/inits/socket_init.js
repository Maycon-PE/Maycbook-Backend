const Sockets = require('../Schemas/socket_document')

function findUnique() {
	return new Promise(async (resolve, reject) => {
		const socket_document = await Sockets.findOne({}, {}, { sort: { 'createdAt': -1 } })

		if (!socket_document) {

			init()
				.then(socket_document => resolve(socket_document))
				.catch(err => reject(err))

		} else {

			resolve(socket_document)

		}
	})
}

function init() {
	return new Promise((resolve, reject) => {
		Sockets.create({ data: {} }, (err, Document) => {

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

					reject('socket_document não criado')

				}

			}

		})
	})
}

function update({ where, data }) {
	return new Promise((resolve, reject) => {
		Sockets.updateOne(where, data, (err, result) => {

			if (err) {

				reject(err)

			} else {

				if (result.nModified) {

					resolve()

				} else {

					reject('Nada alterado')

				}

			}

		})
	})
}

function getin(data) {
	return new Promise((resolve, reject) => {
		findUnique()
			.then(socket_document => {

				socket_document.data[data.user_id] = data.socket_id

				update({ where: { _id: socket_document._id }, data: socket_document })
					.then(() => resolve())
					.catch(err => reject(err))

			}).catch(err => reject(err))
	})
}

function getout(value) {
	return new Promise((resolve, reject) => {
		findUnique()
			.then(socket_document => {

				Object.keys(socket_document.data).forEach(key => {
					if (socket_document.data[key] === value) {
						socket_document.data[key] = 'offline'
					}
				})

				update({ where: { _id: socket_document._id }, data: socket_document })
					.then(() => resolve())
					.catch(err => reject(err))

			})
	})
}


module.exports = {

	getin,

	getout

}
