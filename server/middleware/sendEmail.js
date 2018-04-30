const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

var options = {
    service: 'SendGrid',
    auth: {
        api_user: 'lambo4bkfast',
        api_key: 'Gameofthrones123#'
    }
}

var client = nodemailer.createTransport(sgTransport(options));

const sendEmail = (req, res, next) => {
    let email = {
        from: 'arakee1@unlv.nevada.edu',
        to: req.body.email,
        subject: 'Hello',
        text: 'Hello world',
        html: '<b>Hello world</b>'
      }

    client.sendMail(email, function(err, info){
        if (err ){
            res.status(400).send()
        }
        else {
            next()
        }
    });
}

module.exports = {
    sendEmail
}