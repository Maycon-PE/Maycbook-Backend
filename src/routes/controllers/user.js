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

								User.create({	user_id: id	}, async (err, { _doc }) => {
									if (err) {

										req
											.mysql('user')
											.where({ id })
											.first()
											.del()
											.then(() => res.status(500).send(err))
											.catch(err => res.status(500).send(err))

									} else {
										const payload = await gerate(_doc._id)

										res.status(201).json(payload)
									}
								})

							}).catch(err => {
								res.status(500).send(err)
							})

					} else {
						res.status(400).send('Usuário já existe')
					}
				}).catch(() => {
					res.status(500).send()
				})			
		} catch(msg) {
			res.status(400).send(msg)
		}
	}
	
}