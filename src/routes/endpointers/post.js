const multer = require('multer')
const routes = require('express').Router()

const user = require('../controllers/user')
const post = require('../controllers/post')

const storage = require('../../services/multer')

const upload = multer({ storage })

routes
	.post('/user', user.store)
	.post('/login', user.login)
	.post('/auth/reconnect', user.reconnect)
	.post('/auth/action/:recipient/:action', user.actions)
	.post('/auth/post', upload.single('image'), post.store)

module.exports = app => app.use(routes)
