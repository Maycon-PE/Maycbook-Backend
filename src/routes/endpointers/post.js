const routes = require('express').Router()

const user = require('../controllers/user')

routes
	.post('/user', user.store)
	.post('/login', user.login)

module.exports = app => app.use(routes)
