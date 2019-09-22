require('dotenv').config()
const bodyParser = require('body-parser')

const app = require('express')()

const config = require('../../knexfile')

const port = process.env.PORT || 8080

require('../database/mongodb')
const db = require('knex')(config)

db.migrate.latest()

app.use(bodyParser.json())

app.use((req, res, next) => {
	req.mysql = db

	next()
})

require('../routes')(app)

app.listen(port, err => console.log(err || `Servidor rodando na porta ${port}` ))
