const sharp = require('sharp')
const { existsSync, unlink } = require('fs')

const Post_int = require('../../database/mongodb/inits/post_init')
const User_int = require('../../database/mongodb/inits/user_init')

module.exports = {

	index(req, res) {

		console.log(req.query)

		const by_id = req.query._id

		if (by_id) {
			res.send('Por _id')
		} else {
			res.send('Por who e date')
		}

	},

	store(req, res) {
		try {

			if (!Object.values(req.body).length) throw 'Nenhum dado'

			const { text } = req.body

			if (text.length > 300) throw 'Legenda muito grande'

			if (!text.length) throw 'Sem legenda'

			if (!Object.values(req.file).length) throw 'Sem imagem'

			const { destination, path, filename } = req.file

			const saveImage = () => {
				return new Promise((resolve, reject) => {

					sharp(path)
						.resize(350, 350)
						.jpeg({ quality: 100 })
						.toFile(`${destination}/uploads/posts/${filename}.jpg`)
						.then(async info => {

							if (existsSync(path)) {
								unlink(path, err => {
									if (err) return reject(err)

									resolve()	
								})
							} else {
								resolve()
							}

						}).catch(err => reject(err))

				})
			}

			const saveData = () => {
				return new Promise((resolve, reject) => {

					Post_int.init(req.payload.id)
						.then(Document => {

								const post = {
									content: text,
									user_id: +req.payload.id,
									stats: `${Document._id}`,
									path: `posts/${filename}.jpg`
								}

								req.mysql('post')
									.insert(post)
									.then(([ id ]) => {

										const _id = Document._id

										delete Document._id

										delete Document.__v

										const date = new Date()

										const date_formated = `${ date.getDate() < 10 ? '0' + date.getDate() : date.getDate() }/${ date.getMonth() +  1 < 10 ? '0' + (date.getMonth() +  1) : date.getMonth() }/${ date.getFullYear() }-${ date.getHours() < 10 ? '0' + date.getHours() : date.getHours() }:${ date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() }:${ date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds() }`

										const post_document = {
											...Document,
											post_id: id,
											date: date_formated
										}

										Post_int.update({ _id, data: post_document })
											.then(() => {

												User_int.find(+req.payload.id)
													.then(user_document => {

														delete user_document._doc._id
														delete user_document._doc.__v

														const newUser_document = {
															...user_document._doc,
															posts: user_document._doc.posts.unshift(id)
														}

														User_int.update({ id: +req.payload.id, data: newUser_document })
															.then(() => resolve())
															.catch(err => reject(err))

													}).catch(err => reject(err))

											}).catch(err => reject(err))

									}).catch(err => reject(err))

						}).catch(err => reject(err))

				})
			}

			saveImage()
				.then(() => {

					saveData()
						.then(() => res.status(201).send())
						.catch(err => res.status(500).send(err))

				}).catch(err => res.status(500).send(err))

		} catch(err) {
			res.status(400).send(err)
		}

	}

}
