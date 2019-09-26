require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')

const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const config = require('../../knexfile')

const port = process.env.PORT || 8080

require('../database/mongodb')
const db = require('knex')(config)

db.migrate.latest()

app.use(cors())
app.use(bodyParser.json())

io.on('connection', socket => {
	console.log('Usuário conectado ', socket.handshake.query)
})

app.use((req, res, next) => {
	req.mysql = db
	req.io = io

	next()
})

require('../routes')(app)

server.listen(port, err => console.log(err || `Servidor rodando na porta ${port}` ))
