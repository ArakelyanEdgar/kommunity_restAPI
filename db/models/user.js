//DEFINES USER SCHEMA

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        maxlength: 16,
        minlength: 2
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 32
    }
})

//hash password before save thereby never storing plaintext password 
userSchema.pre('save', async function(next) {
    let user = this

    try{
        let salt = await bcrypt.genSalt()
        let hash = await bcrypt.hash(user.password, salt)
        user.password = hash
        return next()
    }catch(err){
        return next(err)
    }
})

//Creates users collection
const User = mongoose.model('User', userSchema)

module.exports = {
    User
}