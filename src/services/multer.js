const { resolve } = require('path')
const { diskStorage } = require('multer')

module.exports = diskStorage({
  destination: (req, file, cb) => cb(null, resolve(__dirname, '..', 'static')),

  filename: (req, file, cb) => {
  	const part1 = req.payload.id
  	const part2 = req.payload.name.replace(/ /g, '')
  	const filename =  `${part1}_${part2}-${Date.now()}`
  	cb(null, filename)
  }
})
