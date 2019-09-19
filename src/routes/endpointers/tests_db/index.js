const routes = require('express').Router()

const tests_db = require('../../controllers/tests_db')

routes.get('/tests/index?:table', tests_db.index)

routes.get('/tests/insert', tests_db.insert)

routes.get('/tests/del?:table', tests_db.del)

routes.get('/tests/latest', tests_db.latest)

routes.get('/tests/rollback', tests_db.rollback)

module.exports = app => app.use(routes)
