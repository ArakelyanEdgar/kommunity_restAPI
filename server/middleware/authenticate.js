const {User} = require('../../db/models/user')

//verifies current x-auth cookie is correct, else middleware ends client's request to server
const authenticate = async (req, res, next) => {
    let token = req.cookies['x-auth']
    if (!token)
        return res.status(401).send()
    
    //find if user with token exists
    try{
        let user = await User.findByToken(token)
        req.user = user
        next()
    }catch(err){
        res.status(401).send()
    }
}

module.exports = {
    authenticate
}