require('dotenv').config()
const { sign, verify } = require('jsonwebtoken')

module.exports = {

	gerate(id) {
		return new Promise((resolve, reject) => {
			const now = Math.floor(Date.now() / 1000)
			const payload = {
				['document']: id,
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
			if (err) return cb({ status: false })

			cb({ status: true, decoded })
		})
	}

}
