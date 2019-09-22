require('dotenv').config()
const { connect } = require('mongoose')


module.exports = connect(process.env.MONGO_URL, { 
	useNewUrlParser: true,
	useUnifiedTopology: true
})

