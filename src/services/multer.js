const { resolve } = require('path')
const { diskStorage } = require('multer')

const destination = (req, file, cb) => cb(null, resolve(__dirname, '..', 'static'))

const up_user = diskStorage({
	destination,
	filename: (req, file, cb) => {
		const part1 = file.originalname.split('.')[0]
		const part2 = '_profile_'
		const part3 = Date.now()
		const filename = `${part1}${part2}${part3}`
		cb(null, filename)
	}
})

const up_post = diskStorage({
	destination,
	filename: (req, file, cb) => {
	  const part1 = req.payload.id
		const part2 = req.payload.name.replace(/ /g, '')
		const filename =  `${part1}_${part2}-${Date.now()}`
		cb(null, filename)
	}
})

module.exports = {
	up_post, up_user
}

