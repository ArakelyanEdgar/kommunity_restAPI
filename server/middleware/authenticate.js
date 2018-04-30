const {User} = require('../../db/models/user')

//verifies current x-auth cookie is correct, else middleware ends client's request to server
const authenticate = async (req, res, next) => {
    let token = req.cookies['x-auth']
    if (!token)
        return res.status(401).send()
    
    //find if user with token exists
    try{
        let user = await User.findByToken(token)
        //save token to req so that we can findByToken again and verify other requests such as remove account
        req.token = user.token
        req.email = user.email
        next()
    }catch(err){
        res.status(401).send()
    }
}

module.exports = {
    authenticate
}