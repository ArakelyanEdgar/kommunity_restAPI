const express = require('express')
const app = express()

//database libraries
const {mongoose} = require('../db/server/mongoose')
const {User} = require('../db/models/user')

//libraries
const bodyParser = require('body-parser')
const _ = require('lodash')

//middleware
app.use(bodyParser.json())             

//GET /users/:username | retrieves user with username
app.get('/users/:username', async (req, res) => {
    let username = req.params.username

    try{
        let user = await User.findOne({username})
        //if user doesn't exist send 404
        if (!user)
            return res.status(404).send()
        res.status(200).send(user)
    }catch(e){
        return res.status(400).send()
    }
})

//DELETE /users/username | removes user with username
app.delete('/users/:username', async (req, res) => {
    let username = req.params.username

    try{
        let user = await User.findOne({username})
        if (!user)
            return res.status(404).send()
        await user.remove()
        return res.status(200).send()
    }catch(e){
        return res.status(400).send()
    }
})

//POST /signup | creates a new user
app.post('/users/signup', async (req, res) => {
    let body = _.pick(req.body, 'username', 'password')
    if (!body.username || !body.password)
        return res.status(400).send()
    let user = new User(body)

    try{
        //create user
        user = await user.save()
        res.status(200).send()
    }catch(e){
        return res.status(400).send()
    }
})

let port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server deployed on port: ${port}`)
})