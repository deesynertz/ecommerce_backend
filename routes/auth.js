const express = require('express');
const {check, validationResult, body} = require('express-validator');
const router = express.Router();
const helper = require('../config/helpers');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { callbackPromise } = require('nodemailer/lib/shared');


// REGISTER ROUTE
// TODO: HANDLE THE DUPLICATE EXIST EMAIL
router.post('/register', [
    check('email').isEmail().not().isEmpty().withMessage('Field can\'t be empty')
        .normalizeEmail({all_lowercase: true}), body('email').custom(value => {
        return helper.database.table('users')
            .filter({$or: [{email: value}]})
            .get()
            .then(user => {
                if (user) {
                    console.log(user);
                    return Promise.reject('Email already exists, choose another one.');
                }
            })
    })
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    } else {
        let {firstName, lastName, region, district, phone, email, username} = req.body;
        let password = await bcrypt.hash(req.body.password, 10)
        let role_id = req.body.role_id;

        helper.database.table('users').insert({
            firstName: firstName,
            lastName: lastName,
            region: region,
            district: district,
            phone: phone,
            email: email
        }).then(lastId => {
            if (lastId > 0) {
                // INSERT USER IN LOGIN TABLE
                helper.database.table('login')
                    .insert({
                        username: username,
                        password: password,
                        user_id: lastId,
                        role_id: role_id
                    }).catch(err => console.log(err));
                    
                    // take care of mail activation
                    // sendVerficationEmail();
            } else {
                res.status(501).json({
                    success: 0,
                    message: 'Registration failed.'
                });
            }
        }).catch(err => res.status(433).json({error: err}));
    }
});

async function sendVerficationEmail() {

    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    // let testAccount = await nodemailer.createTestAccount();


    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.MAIL_NAME, // generated ethereal user
          pass: process.env.MAIL_PASSWORD, // generated ethereal password
        },
      });


    let mailOption = {
        from: `"Deesynertz"< ${process.env.MAIL_NAME} >`, // sender address
        to: 'axetrixhub.gmail.com', // list of receivers
        subject: "Activation Link", // Subject line
        html: `<h1>Hi Axe</h1><b>
        <h4>Thank you for joing us Please activate your account by clicking link below</h4><b>
        <a href="http://localhost:3000/register">Activate</a>`, // html body
    }

    transporter.sendMail(mailOption, (error, info) => {
        if(error) {
            console.log(error);
        }else {
            console.log('Registration successful. <br>please Check your Email to activate your accout '+ info.response);
        }
    })



     
}

  
sendVerficationEmail().catch(console.error);

// LOGIN ROUTE
router.post('/login', async (req, res) => {

    const myPlaintextPassword = req.body.password;
    const myUsername = req.body.username;

    const login_user = await helper.database.table('login')
        .filter({$or: [{username: myUsername}]}).get();
    if (login_user) {
        const match = await bcrypt.compare(myPlaintextPassword, login_user.password);
        if (match) {
            jwt.sign({
                state: 'true', userId: login_user.user_id, role: login_user.role_id,
                username: login_user.username
            },
            `${helper.secret}`,
            {algorithm: 'HS512', expiresIn: '2h'},
            (err, token) => {
                res.json({ token:token });
            });
        } else {
            res.status(201).json({
                message: "incorrect password!!"
            });
        }
    } else {
        res.status(201).json({
            message: "Username or password incorrect"
        });
    }
})

// TODO: HANDLE FIND USER BY EMAIL
router.get('/email/:emailId', (req, res) => {
    const orderEmail = req.params.email;
    database.table('customer')
        .withFields(['email'])
        .filter({'email': orderEmail})
        .get()
        .then(user => {
            if (user) {
                res.status(200).json(user);
            } else {
                res.json({message: 'not exist'});
            }
        })
        .catch(err => console.log(err));
});

module.exports = router;
