const express = require('express')
const app = express()

//database libraries
const {mongoose} = require('../db/server/mongoose')
const {User} = require('../db/models/user')

//libraries
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const _ = require('lodash')
const {authenticate} = require('./middleware/authenticate')

app.use(bodyParser.json())             
app.use(cookieParser())

//POST /signup | creates a new user
app.post('/users/signup', async (req, res) => {
    let body = _.pick(req.body, 'username', 'password')
    if (!body.username || !body.password)
        return res.status(400).send()
    let user = new User(body)
    try{
        //create user
        user = await user.save()
        //clear possible cookie x-auth token from past session
        res.clearCookie('x-auth')
        //get auth token and create cookie
        let token = await user.generateAuthToken()
        res.status(200).cookie('x-auth', token).send()
    }catch(e){
        return res.status(400).send()
    }
})

//GET /users/:username | retrieves user with username
app.get('/users/:username', async (req, res) => {
    let username = req.params.username

    try{
        let user = await User.findOne({username})
        //if user doesn't exist send 404
        if (!user)
            return res.status(404).send(user)
        res.status(200).send(user)
    }catch(e){
        return res.status(400).send()
    }
})

//DELETE /users/username | removes user with username
app.delete('/users/:username', authenticate, async (req, res) => {
    try{
        //check if user is only deleting their own user and then do it
        if (req.params.username !== req.user.username)
            return res.status(401).send()
        await req.user.remove()
        res.clearCookie('x-auth')
        return res.status(200).send()
    }catch(e){
        return res.status(400).send()
    }
})

let port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server deployed on port: ${port}`)
})