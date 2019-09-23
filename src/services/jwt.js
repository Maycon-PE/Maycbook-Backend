require('dotenv').config()
const { sign, verify } = require('jsonwebtoken')

module.exports = {

	gerate(slice) {
		return new Promise((resolve, reject) => {
			const now = Math.floor(Date.now() / 1000)
			const payload = {
				...slice,
				exp: now + (60 * 60 * 24 * 7),
				iat: now
			}

			sign(payload, process.env.SECRET_WORD || 'development', { }, (err, token) => {
				if (err) return reject(err)

				payload.token = token

				resolve(payload)
			})
		})
	},

	verify(hash, cb) {
		verify(hash, process.env.SECRET_WORD || 'development', (err, decoded) => {
			if (err) return cb({ status: false, msg: 'Token expirado' })

			cb({ status: true, decoded })
		})
	}

}
