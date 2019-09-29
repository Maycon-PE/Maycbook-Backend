const routes = require('express').Router()

const post = require('../controllers/post')

routes
	.get('/post', post.index)

module.exports = app => app.use(routes)
