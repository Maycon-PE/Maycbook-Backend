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

function update({ id, data }) {
	return new Promise((resolve, reject) => {
		Talk.updateOne({ user_id: id }, data, (err, result) => {

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

function setMessage({ sended, name, me, you, msg }) {
	return new Promise((resolve, reject) => {
		find(me)
			.then(my_document => {
				const previusPrivate = my_document.private.filter(({ who_id }) => who_id === you)

				const date = new Date()

				const date_formated = `${ date.getDate() < 10 ? '0' + date.getDate() : date.getDate() }/${ date.getMonth() +  1 < 10 ? '0' + (date.getMonth() +  1) : date.getMonth() }/${ date.getFullYear() }-${ date.getHours() < 10 ? '0' + date.getHours() : date.getHours() }:${ date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() }:${ date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds() }`

				if (previusPrivate.length) {
					const newMsg = {
						id: sended, msg,
						date: date_formated
					}
					const data = { who_id: you, data: [ ...previusPrivate[0].data, newMsg ] }
					my_document.private = my_document.private.map(privateData => privateData.who_id === you ? data : privateData )
				} else {
					my_document.private.push({
						who_id: you,
						initio: date_formated,
						name,
						data: [{
							id: sended,
							msg,
							date: date_formated
						}]
					})
				}
				
				update({ id: me, data: my_document })
					.then(() => {
						resolve()
					}).catch(err => reject(err))
			}).catch(err => reject(err))
	})
}

module.exports = {

	find,

	init,

	setMessage,

	update

}
