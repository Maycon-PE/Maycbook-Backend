const routes = require('express').Router()

const user = require('../controllers/user')

routes
	.post('/user', user.store)
	.post('/login', user.login)
	.post('/auth/reconnect', user.reconnect)

module.exports = app => app.use(routes)
