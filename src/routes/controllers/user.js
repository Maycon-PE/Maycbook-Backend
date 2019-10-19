const { genSaltSync, hashSync, compare } = require('bcryptjs')
const sharp = require('sharp')
const { existsSync, unlink } = require('fs')

const { gerate } = require('../../services/jwt')

const User_init = require('../../database/mongodb/inits/user_init')
const Post_init = require('../../database/mongodb/inits/post_init')
const Talk_init = require('../../database/mongodb/inits/talk_init')
const TalkAll_init = require('../../database/mongodb/inits/talkAll_init')

module.exports = {

		notifications(req, res) {

			try {

				const selectField = field => {
					return new Promise((resolve, reject) => {
						User_init.find({ user_id: +req.payload.id })
							.then(user_document => {
								const iWant = user_document[field]

								resolve(iWant)

							}).catch(err => {
								reject(err)
							})	
					})
				}

				const mode = req.params.mode

				if (mode === 'notifications') {

					selectField('notifications')
						.then(result => {
							res.status(200).json(result)
						}).catch(err => res.status(500).send(err))

				} else if (mode === 'dialogues') {

					selectField('dialogues')
						.then(result => {
							res.status(200).json(result)
						}).catch(err => res.status(500).send(err))

				} else {
					res.status(400).send('O que você quer, não é esperado')
				}

			} catch(e) {
				res.status(500).send(e)
			}

		},

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

			const resizeImage = () => {
				return new Promise((resolve, reject) => {
					const { path, destination, filename } = req.file

					sharp(path)
						.resize(200, 200)
						.jpeg({ quality: 100 })
						.toFile(`${destination}/uploads/profiles/${filename}.jpg`)
						.then(() => {

							if (existsSync(path)) {
								unlink(path, err => {
									if (err) return reject(err)

									resolve()
								})
							} else {
								resolve()
							}

						}).catch(() => reject())
				})
			}

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

						user.image = `profiles/${req.file.filename}.jpg`

						req
							.mysql('user')
							.insert(user)
							.then(([ id ]) => {
								User_init.init({ user_id: id })
									.then(user_document => {
										Talk_init.init({ user_id: id })
											.then(async talk_document => {
												delete user.password

												resizeImage()
													.then(() => {


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

						User_init.find({ user_id: user.id })
							.then(user_document => {

								Talk_init.find({ user_id: user.id })
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
		User_init.find({ user_id: req.payload.id })
			.then(user_document => {

				Talk_init.find({ user_id: req.payload.id })
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

			User_init.find({ user_id: recipient })
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
					}

					User_init.update({ where: { user_id: recipient }, data: recipient_document })
						.then(() => {

							if (action === 'dialogues') {

								Promise.all([
									Talk_init.setMessage({ sended: +req.payload.id, name: req.payload.name, me: +req.payload.id, you: recipient, msg: data.msg }),
									Talk_init.setMessage({ sended: +req.payload.id, name: req.payload.name, me: recipient, you: +req.payload.id, msg: data.msg })
								]).then(() => {
									const socket_recipient = req.sockets[`${recipient}`]
									if (socket_recipient) {
										req.io.to(socket_recipient).emit('dialogues', data)
									}
								})
								.catch(err => console.log(err))

							} else if (action === 'notifications') {

								const socket_recipient = req.sockets[`${recipient}`]
								if (socket_recipient) {
									req.io.to(socket_recipient).emit('notifications', data)
								}

							}

							res.status(200).json(data.msg)
						}).catch(err => res.status(500).send(err))

				}).catch(err => res.status(400).send(err))
			
		} catch (err) {
			res.status(500).send(err)
		}

	},

	talk(req, res) {
		try {
			const data = {
				who_id: +req.payload.id,
				name: req.payload.name,
				image: req.payload.image,
				msg: req.body.msg
			}

			req.io.emit('talk_all', data)
			res.status(200).send()

			// TalkAll_init.findUnique()
			// 	.then(talkAll_document => {

			// 		talkAll_document.all.push(data)

			// 		TalkAll_init.update({ where: { _id: talkAll_document._id }, data: talkAll_document })
			// 			.then(() => {
			// 				req.io.emit('talk_all', data)
			// 				res.status(201).json(talkAll_document)
			// 			}).catch(err => {
			// 				res.status(400).send(err)
			// 			})
					
			// 	}).catch(err => {
			// 		res.status(500).send(err)
			// 	})

		} catch(e) {
			res.status(500).send(e)
		}
	}

}
