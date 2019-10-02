const routes = require('express').Router()

const post = require('../controllers/post')

routes
	.get('/auth/post?:page', post.index)

module.exports = app => app.use(routes)
