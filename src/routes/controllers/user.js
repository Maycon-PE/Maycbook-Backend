require('dotenv').config()
const { genSaltSync, hashSync, compare } = require('bcryptjs')
const { gerate, verify } = require('../../services/jwt')

const User = require('../../database/mongodb/Schemas/user_document')

module.exports = {

	store(req, res) {
		try {

			const user = { ...req.body }

			req
				.mysql('user')
				.where({ email: user.email })
				.select('id')
				.first()
				.then(has => {
					if (!has) {

						if (user.password !== user.confirmPassword) throw 'Senhas diferentes!!'

						if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(user.email)) throw 'Email inválido!!!'

						if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,14}$/.test(user.password)) throw 'A senha deve conter no minímo 3 carácteres entre letras e números!!!'

						if (!/^[a-záàâãéèêíïóôõöúçñ ]+$/i.test(user.name)) throw 'Nome inválido!!!'

						if (user.genre !== 'm' && user.genre !== 'f') throw 'Gênero inválido!!!'

						const salt = genSaltSync(10)

						user.password = hashSync(user.password, salt)
							
						delete user.confirmPassword

						req
							.mysql('user')
							.insert(user)
							.then(([ id ]) => {

								User.create({	user_id: id	}, async (err, Document) => {
									if (err) {

										req
											.mysql('user')
											.where({ id })
											.first()
											.del()
											.then(() => res.status(500).send(err))
											.catch(err => res.status(500).send(err))

									} else {
										delete user.password

										if (Document._doc) {

											const payload = await gerate({ ['document']: Document._doc._id, id, ...user, image: 'default.jpg' })

											res.status(201).json(payload)

										} else {
											res.status(500).send('Documento não existe')
										}
									}
								})

							}).catch(err => {
								res.status(500).send(err)
							})

					} else {
						res.status(400).send('Usuário já existe')
					}
				}).catch(() => {
					res.status(500).send('Falha na consulta')
				})			
		} catch(msg) {
			res.status(400).send(msg)
		}
	},

	login(req, res) {
		try {

			const { email, password } = req.body

			req
				.mysql('user')
				.where({ email })
				.first()
				.then(async user => {
					if (user) {

						if (!await compare(password, user.password)) return res.status(400).send('Senha incorreta')

						delete user.password
						delete user.created_at
						delete user.updated_at

						User.findOne({ user_id: user.id }, async (err, Document) => {

							if (!err) {

								if (Document) {
									console.log('tem')

									const payload = await gerate({ ['document']: Document._id, ...user })

									res.status(200).json(payload)

								} else {
									console.log('não tem')

									User.create({ user_id: user.id }, async (err, Document) => {

										if (!err) {

											if (Document._doc) {

												console.log('criei')

												const payload = await gerate({ ['document']: Document._doc._id, ...user })

												res.status(201).json(payload)

											} else {
												res.status(500).send('Documento não existe')
											}

										} else {
											res.status(500).send('Não foi possivél criar um documento')
										}

									})

								}

							} else {
								res.status(500).send('Falha na procura do documento')
							}

						})

					} else {
						res.status(400).send('Usuário não encontrado')
					}
				}).catch(e => {
					res.status(500).send('Falha na consulta')
				})

		} catch(msg) {
			res.status(400).send(msg)
		}
	}

}