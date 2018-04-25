//DEFINES USER SCHEMA

const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        maxlength: 16,
        minlength: 2
    }
})

//Creates users collection
const User = mongoose.model('User', userSchema)

module.exports = {
    User
}