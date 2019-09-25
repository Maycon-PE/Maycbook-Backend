const routes = require('express').Router()

const user = require('../controllers/user')

routes
	.post('/user', user.store)
	.post('/login', user.login)
	.post('/auth/reconnect', user.reconnect)
	.post('/auth/action/:recipient/:action', user.actions)

module.exports = app => app.use(routes)
