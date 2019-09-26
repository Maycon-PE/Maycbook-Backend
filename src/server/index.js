require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')

const app = require('express')()
app.use(cors())
app.use(bodyParser.json())
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const config = require('../../knexfile')

const port = process.env.PORT || 8080

require('../database/mongodb')
const db = require('knex')(config)
db.migrate.latest()

const Socket_init = require('../database/mongodb/inits/socket_init')

const sockets = {}

io.on('connection', socket => {
	const user_id = socket.handshake.query.user_id
	const socket_id = socket.id

	Socket_init.getin({ user_id, socket_id })
		.then(() => {
			sockets[user_id] = socket_id
			console.log('registrado', sockets)
		}).catch(err => console.log(err))

		socket.on('disconnect', () => {
			Socket_init.getout(socket.id)
				.then(() => {
					sockets[user_id] = 'offline'
					console.log('deletado do mongo', sockets)
				}).catch(err => console.log(err))
		})
})

app.use((req, res, next) => {
	req.mysql = db
	req.io = io
	req.sockets = sockets

	next()
})

require('../routes')(app)

server.listen(port, err => console.log(err || `Servidor rodando na porta ${port}` ))
