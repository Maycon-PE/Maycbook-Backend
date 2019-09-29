const { genSaltSync, hashSync, compare } = require('bcryptjs')
const { gerate } = require('../../services/jwt')

const User_init = require('../../database/mongodb/inits/user_init')
const Post_init = require('../../database/mongodb/inits/post_init')
const Talk_init = require('../../database/mongodb/inits/talk_init')

module.exports = {

		store(req, res) {

			try {

			const deleteUser = (id, msg) => {
				req
					.mysql('user')
					.where({ id })
					.first()
					.del()
					.then(() => res.status(500).send(msg))
					.catch(err => res.status(500).send(err))
			}

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

						user.password = user.password.toLowerCase()	

						const salt = genSaltSync(10)

						user.password = hashSync(user.password, salt)
							
						delete user.confirmPassword

						user.image = `profiles/default-${user.genre}.jpg`

						req
							.mysql('user')
							.insert(user)
							.then(([ id ]) => {

								User_init.init(id)
									.then(user_document => {

										Talk_init.init(id)
											.then(talk_document => {

												delete user.password

												const slice = {
													['documents']: { 
														user: user_document,
														talk: talk_document
													}, 
													id, 
													...user
												}

												gerate(slice)
													.then(payload => {
														res.status(201).json(payload)
													}).catch(err => {
														res.status(500).send(err)
													})

											}).catch(err => deleteUser(id, err))

									}).catch(err => deleteUser(id, err))
								
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

			const { email } = req.body
			let { password } = req.body

			req
				.mysql('user')
				.where({ email })
				.first()
				.then(async user => {
					if (user) {

						password = password.toLowerCase()

						if (!await compare(password, user.password)) return res.status(400).send('Senha incorreta')

						delete user.password
						delete user.created_at
						delete user.updated_at

						User_init.find(user.id)
							.then(user_document => {

								Talk_init.find(user.id)
									.then(talk_document => {

										const slice = {
											['documents']: { 
												user: user_document,
												talk: talk_document
											}, 
											...user
										}

										gerate(slice)
											.then(payload => {
												res.status(200).json(payload)
											}).catch(err => {
												res.status(500).send(err)
											})

									}).catch(err => res.status(500).send(err))

							}).catch(err => res.status(500).send(err))

					} else {
						res.status(400).send('Usuário não encontrado')
					}
				}).catch(e => {
					res.status(500).send('Falha na consulta')
				})

		} catch(msg) {
			res.status(400).send(msg)
		}
	},

	reconnect(req, res) {
		User_init.find(req.payload.id)
			.then(user_document => {

				Talk_init.find(req.payload.id)
					.then(talk_document => {

						delete req.payload.documents
						delete req.payload.token

						const slice = {
							['documents']: { 
								user: user_document,
								talk: talk_document
							}, 
							...req.payload
						}

						gerate(slice)
							.then(payload => {
								res.status(200).json(payload)
							}).catch(err => {
								res.status(500).send(err)
							})

					}).catch(err => res.status(500).send(err))

			}).catch(err => res.status(500).send(err))
	},

	actions(req, res) {

		try {
			const date = new Date()

			const date_formated = `${ date.getDate() < 10 ? '0' + date.getDate() : date.getDate() }/${ date.getMonth() +  1 < 10 ? '0' + (date.getMonth() +  1) : date.getMonth() }/${ date.getFullYear() }-${ date.getHours() < 10 ? '0' + date.getHours() : date.getHours() }:${ date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() }:${ date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds() }`

			const recipient = +req.params.recipient
			const action = req.params.action

			const data = { 
				who: +req.payload.id,  
				date: date_formated,
				...req.body 
			}

			User_init.find(recipient)
				.then(recipient_document => {

					if (action === 'notifications') recipient_document[action].unshift(data)
					else if (action === 'dialogues') {
						if (recipient_document[action].find(cvs => cvs.who === data.who)) {
							recipient_document[action] = recipient_document[action].map(tupla => {

								if (tupla.who === data.who) {
									tupla.msg = data.msg,
									tupla.date = date_formated
								}

								return tupla
							})
						} else recipient_document[action].unshift(data)
					} else {
						if (!recipient_document[action].find(add => add.who === data.who)) recipient_document[action].unshift(data)
					}

					User_init.update({ id: recipient, data: recipient_document })
						.then(() => {

							if (action === 'dialogues') {

								Promise.all([
									Talk_init.setMessage({ sended: +req.payload.id, name: req.payload.name, me: +req.payload.id, you: recipient, msg: data.msg }),
									Talk_init.setMessage({ sended: +req.payload.id, name: req.payload.name, me: recipient, you: +req.payload.id, msg: data.msg })
								]).then(() => {
									const socket_recipient = req.sockets[`${recipient}`]
									if (socket_recipient !== 'offline') req.io.to(socket_recipient).emit('dialogues', data)
								})
								.catch(err => console.log(err))

							} else if (action === 'invites') {
								User_init.find(+req.payload.id)
									.then(my_document => {
									  !my_document.solicitations.includes(recipient) &&	my_document.solicitations.push(recipient)

										User_init.update({ id: +req.payload.id, data: my_document })
											.then(() => {
												const socket_recipient = req.sockets[`${recipient}`]
												if (socket_recipient !== 'offline') req.io.to(socket_recipient).emit('invites', data)
											})
											.catch(err => console.log(err))

									}).catch(err => console.log(err))
							} else {
								const socket_recipient = req.sockets[`${recipient}`]
								if (socket_recipient !== 'offline') req.io.to(socket_recipient).emit('notifications', data)
							}

							res.status(200).json(data.msg)
						}).catch(err => res.status(500).send(err))

				}).catch(err => res.status(400).send(err))
			
		} catch (err) {
			res.status(500).send(err)
		}

	}

}
