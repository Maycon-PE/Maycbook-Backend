const multer = require('multer')
const routes = require('express').Router()

const user = require('../controllers/user')
const post = require('../controllers/post')

const { up_post, up_user } = require('../../services/multer')

const upload_post = multer({ storage: up_post })

const upload_user = multer({ storage: up_user })

routes
	.post('/user', upload_user.single('image'), user.store)
	.post('/login', user.login)
	.post('/auth/reconnect', user.reconnect)
	.post('/auth/talk', user.talk)
	.post('/auth/user/:recipient/:action', user.actions)
	.post('/auth/post', upload_post.single('image'), post.store)
	.post('/auth/post/:action/:post_id/:where', post.actions)

module.exports = app => app.use(routes)
