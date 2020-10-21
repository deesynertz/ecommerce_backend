const express = require('express');
const {check, validationResult, body} = require('express-validator');
const router = express.Router();
const helper = require('../config/helpers');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


// RETURN ROLES EXCEPT FOR Admin
router.get('/roles', (req, res) => {
    helper.database.table('roles')
        .sort({roleId: 1})
        .filter ({ roleId : {$gt : 1}})
        .getAll()
        .then(roles => {
            if (roles.length > 0) {
                res.status(200).json({
                    count: roles.length,
                    roles: roles
                });
            } else {
                res.json({message: "No any Role found"});
            }
        })
})




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
                res.status(201).json({
                    success: 1,
                    message: 'Registration successful.'
                });
            } else {
                res.status(501).json({
                    success: 0,
                    message: 'Registration failed.'
                });
            }
        }).catch(err => res.status(433).json({error: err}));
    }
});

// LOGIN ROUTE
router.post('/login', async (req, res) =>{
    const myPlaintextPassword = req.body.password;
    const myUsername = req.body.username;

    const login_user = await helper.database.table('login')
        .filter({$or: [{username: myUsername}]}).get();
    if (login_user) {
        const match = await bcrypt.compare(myPlaintextPassword, login_user.password);
        if (match) {
            let token = jwt.sign(
                {state: 'true', username: req.body.username},
                helper.secret, {
                    algorithm: 'HS512',
                    expiresIn: '4h'
            });
            res.status(201).json({
                success_code: 1,
                token: token,
                auth: true,
                role: login_user.role_id,
                username: req.body.username
            });
        } else {
            res.status(201).json({
                success_code: 0,
                message: "incorrect password!!"
            });
        }
    } else {
        res.status(201).json({
            success_code: 0,
            message: "Username or password incorrect"
        });
    }
})

// FIND USER BY EMAIL
router.get('/:email', (req, res) => {
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
