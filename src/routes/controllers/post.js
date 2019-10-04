const sharp = require('sharp')
const { existsSync, unlink } = require('fs')

const Post_int = require('../../database/mongodb/inits/post_init')
const User_int = require('../../database/mongodb/inits/user_init')

module.exports = {

	index(req, res) {

		try {

			const limit = 3
			const page = +req.query.page
			console.log('page ', page)

			function delImage(paths) {
				paths.forEach((path, index) => {
					if (existsSync) {
						unlink(`src/static/uploads/${path}`, err => {
							console.log('path ', path)
						})
					}
				})
			}

			function doClear({ posts, documents }) {

				let ids = posts.filter(({ id }) => !documents.find(({ post_id }) => post_id === id ))

				const paths = ids.map(({ path }) => path)
				delImage(paths)
				ids = ids.map(({ id }) => id)

				req
					.mysql('post')
					.del()
					.whereIn('id', ids)
					.then(() => {
						const my_socket = req.sockets[`${req.payload.id}`]

						if (my_socket) req.io.to(my_socket).emit('posts_deleted', ids)
					})
					.catch(() => {
						req.mysql.migrate.rollback()
					})
					.finally(() => doSearch())

			}

			function doSearch() {


				req
				.mysql('post')
				.limit(limit)
				.offset(page)
				.then(posts => {
					posts = posts.reverse()

					const ids = posts.map(({ id }) => id)

					Post_int.aggregate([{ $match: { post_id: { $in: ids } } }])
						.then( async Documents => {
							if (posts.length !== Documents.length) {
								console.log('inconsistência')

								doClear({ posts, documents: Documents })

							} else {
								const result = await req.mysql('post')
									.count('id')
									.first()

								const count = Object.values(result)[0]

								res.status(200).json({ data: { posts, stats: Documents }, pagination: { limit, count } })
							}
						}).catch(err => res.status(500).send(err))

				}).catch(err => res.status(500).send(err))

			}

			doSearch()
	
		} catch(err) {
			res.status(500).send(err)
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
						.resize(450, 450)
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

					Post_int.init({ user_id: +req.payload.id })
						.then(Document => {

								const post = {
									content: text,
									user_id: +req.payload.id,
									author: req.payload.name,
									author_image: req.payload.image,
									stats: `${Document._id}`,
									path: `posts/${filename}.jpg`
								}

								req
									.mysql('post')
									.insert(post)
									.then(([ id ]) => {

										const _id = Document._id

										delete Document._id

										delete Document.__v

										const date = new Date()

										const date_formated = `${ date.getDate() < 10 ? `0${date.getDate()}` : date.getDate() }/${ date.getMonth() +  1 < 10 ? `0${date.getMonth() +  1}` : date.getMonth() + 1 }/${ date.getFullYear() } - ${ date.getHours() < 10 ? `0${date.getHours()}` : date.getHours() }:${ date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes() }:${ date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds() }`

										const post_document = {
											...Document,
											post_id: id,
											date: date_formated
										}

										Post_int.update({ where: { _id }, data: post_document })
											.then(() => {

												User_int.find({ user_id: +req.payload.id })
													.then(user_document => {

														delete user_document._doc._id
														delete user_document._doc.__v

														user_document._doc.posts.unshift(id)

														User_int.update({ where: { user_id: +req.payload.id }, data: user_document._doc })
															.then(() => {
																const data = {
																	name: req.payload.name,
																	image: req.payload.image,
																	who: +req.payload.id,
																	path: post.path
																}

																req.io.emit('requests', data)
																resolve()
															}).catch(err => reject(err))

													}).catch(err => reject(err))

											}).catch(err => reject(err))

									}).catch(err => reject(err))

						}).catch(err => reject(err))

				})
			}

			saveImage()
				.then(() => {

					saveData()
						.then(() => {
							res.status(201).send()
						}).catch(err => res.status(500).send(err))

				}).catch(err => res.status(500).send(err))

		} catch(err) {
			res.status(400).send(err)
		}

	},

	actions(req, res) {

		try {

			const action = req.params.action
			const _id = req.params.post_id
			const where = +req.params.where
			
			const date = new Date()

			const date_formated = `${ date.getDate() < 10 ? `0${date.getDate()}` : date.getDate() }/${ date.getMonth() +  1 < 10 ? `0${date.getMonth() +  1}` : date.getMonth() + 1 }/${ date.getFullYear() } - ${ date.getHours() < 10 ? `0${date.getHours()}` : date.getHours() }:${ date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes() }:${ date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds() }`

			const data = {
				who: +req.payload.id,
				name: req.payload.name,
				image: req.payload.image,
				date: date_formated
			}

			switch(action) {
				case 'like':
					Post_int.find({ _id })
						.then(Document => {

							if (!Document.data.rate.likes.find(({ who }) => who === data.who)) {
								Document.data.rate.likes.unshift(data)

								Post_int.update({ where: { _id }, data: Document })
									.then(() => {
										data.mode = 'like'

										const direct = req.sockets[`${Document.user_id}`]
										const target = req.sockets[`${data.who}`]

										if (target !== direct) {
											if (direct) {
												req.io.to(direct).emit('liked', data)
											} else {
												console.log('salvando curtida no banco ', data)
											}
										}

										req.io.emit('requests', where)

										const likes = Document.data.rate.likes

										res.status(201).json(likes)

									}).catch(err => res.status(500).send(err))
							} else {
								Document.data.rate.likes = Document.data.rate.likes.filter(({ who }) => who !== data.who)

								const likes = Document.data.rate.likes

								Post_int.update({ where: { _id }, data: Document })
									.then(() => {
										data.mode = 'dislike'

										const direct = req.sockets[`${Document.user_id}`]
										const target = req.sockets[`${data.who}`]

										if (target !== direct) {
											if (direct) {
												req.io.to(direct).emit('disliked', data)
											} else {
												console.log('salvando descurtida no banco ', data)
											}
										}

										req.io.emit('requests', where)

										const likes = Document.data.rate.likes

										res.status(201).json(likes)

									}).catch(err => res.status(500).send(err))

							}

						}).catch(err => {
							res.status(400).send(err)
						})

					break;

				case 'comment':

					data.msg = req.body.msg

					Post_int.find({ _id })
						.then(Document => {
							Document.data.comments.unshift(data)

							Post_int.update({ where: { _id }, data: Document })
								.then(() => {
									data.mode = 'comment'

									const direct = req.sockets[`${Document.user_id}`]
									const target = req.sockets[`${data.who}`]

									if (target !== direct) {
										if (direct) {
											req.io.to(direct).emit('commented', data)
										} else {
											console.log('salvando comentario no banco ', data)
										}
									}

									req.io.emit('requests', where)

									const comments = Document.data.comments

									res.status(201).json(comments)
								}).catch(err => res.status(500).send(err))

						}).catch(err => res.status(400).send(err))

					break;

				default:
					res.status(400).send('Ação não reconhecida')	
			}

		} catch(err) {
			res.status(500).send(err)
		}

	}

}
