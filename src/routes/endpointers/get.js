const routes = require('express').Router()

const post = require('../controllers/post')
const user = require('../controllers/user')

routes
	.get('/auth/post?:page', post.index)
	.get('/auth/user/:mode', user.notifications)

module.exports = app => app.use(routes)
