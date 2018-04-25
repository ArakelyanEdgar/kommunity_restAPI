const mongoose = require('mongoose')
const db = 'mongodb://localhost:27017/Kommunity'

//allow promises for mongoose callbacks
mongoose.Promise = global.Promise

//db listens for connections
mongoose.connect(db)

module.exports = {
    mongoose
}