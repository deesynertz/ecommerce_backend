const express = require('express');
const {check, validationResult, body} = require('express-validator');
const router = express.Router();
const helper = require('../config/helpers');
const authConfig = require('../config/check-auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { request } = require('express');



// REGISTER ROUTE
// TODO: HANDLE THE DUPLICATE EXIST EMAIL
router.post('/register', [authConfig.checkEmailExist], async (req, res) => {

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
            })
            .then(lastLogId => {
                if(lastLogId > 0){

                    // TODO: take care of mail activation
                    // sendVerficationEmail();
                    res.json({
                        success: 1,
                        message: 'successful Registared.'
                    })
                }else{
                    console.log('something went wrong during inserting user in login table')
                }
            }).catch(err => console.log(err));
        } else {
            res.status(501).json({
                success: 0,
                message: 'Registration failed.'
            });
        }
    }).catch(err => res.status(433).json({error: err}));
    
});

  
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
