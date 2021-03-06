require('dotenv').config()
const { verify } = require('../../services/jwt')

module.exports = (req, res, next) => {

	try {

		const token = req.headers.authorization

		if (!token) throw 'Token não providênciado'

		if (!/^Bearer /.test(token)) throw 'Token não idêntificado'

		if (token.split(' ').length !== 2) throw 'Token mal formatado'

		const [bearer, hash] = token.split(' ')

		verify(hash, result => {
			if (result.status) {
				req.payload = result.decoded

				next()
			} else {
				res.status(401).send(result.msg)		
			}
		})

	} catch(msg) {
		res.status(401).send(msg)
	}
}
