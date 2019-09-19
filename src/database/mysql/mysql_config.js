require('dotenv').config()

module.exports = {
  database: process.env.DATABASE || '',
  user:     process.env.USER || '',
  password: process.env.PASSWORD || ''
}
