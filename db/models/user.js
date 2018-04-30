//DEFINES USER SCHEMA

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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
    },
    token: {
        type: String
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

//verifies that passed password hashed is the same as the stored hashed password
userSchema.methods.verifyPassword = async function(password){
    let user = this

    try{
        let res = await bcrypt.compare(password, user.password)
        if (!res)
            throw new Error()
        return true
    }catch(err){
        return false
    }
}

userSchema.methods.generateAuthToken = async function(){
    let user = this

    //create token and save token to user
    let token = jwt.sign({
        _id: user._id.toHexString()
    }, 'key').toString()
    user.token = token
    await user.save()
    return token
}

//find a user with the token and jwt.verify that the decoded user is the same as the user with the given token
userSchema.statics.findByToken = async function(token){
    let user = await this.findOne({token})
    if (!user)
        throw new Error()
    let decodedUser = jwt.verify(token, 'key')
    if (decodedUser._id !== user._id.toHexString())
        throw new Error()
    return user
}

//Creates users collection
const User = mongoose.model('User', userSchema)

module.exports = {
    User
}