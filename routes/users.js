const express = require('express');
const router = express.Router();
const helper = require('../config/helpers');
const checkAuth = require('../config/check-auth');


// RETURN ROLES FOR Admin
router.get('/roles', [checkAuth.userToken, checkAuth.verifyTheToken], (req, res) => {
    helper.database.table('roles')
    .sort({roleId: 1})
    .getAll()
    .then(roles => {
        if (roles.length > 0) {
            res.json({
                count: roles.length,
                roles: roles,
            });
        } else {
            res.json({
                count: roles.length,
                message: "No any Role found"
            });
        }
    })
});

/* GET users listing. */
router.get('/', [checkAuth.userToken, checkAuth.verifyTheToken], (req, res) => {
    helper.database.table('users')
        .withFields(['userId', 'firstName', 'lastName', 'region', 'district', 'phone', 'email'])
        .getAll().then((list) => {
        if (list.length > 0) {
            res.json({users: list});
        } else {
            res.json({message: 'NO USER FOUND'});
        }
    }).catch(err => res.json(err));
});

// RETURN ROLES EXCEPT admin FOR OTHERS
router.get('/roles/others', (req, res) => {
    helper.database.table('roles')
    .sort({roleId: 1})
    .filter({roleId: {$gt: 1}})
    .getAll()
    .then(roles => {
        if (roles.length > 0) {
            res.json({
                count: roles.length,
                roles: roles,
            });
        } else {
            res.json({
                count: roles.length,
                message: "No any Role found"
            });
        }
    })
});

// GET PRODUCT BELONG TO USER
router.get('/products/:userId', [checkAuth.userToken, checkAuth.verifyTheToken], (req, res) => {
    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10; // set limit of items per page
    let startValue;
    let endValue;

    if (page > 0) {
        startValue = (page * limit) - limit; // 0, 10, 20, 30
        endValue = page * limit; // 10, 20, 30, 40
    } else {
        startValue = 0;
        endValue = 10;
    }
    const ownerId = req.params.userId;
    helper.database.table('products as p')
        .join([{
            table: 'users as u',
            on: `u.userId = p.owner`
        },
            {
                table: 'categories as c',
                on: 'c.categoryId = p.category'
            }
        ])
        .filter({
            'p.owner': ownerId
        })
        .withFields([
            'c.name as category',
            'p.productName as title', 'p.price', 'p.quantity',
            'p.description', 'p.discount', 'p.image', 'p.productId as id'
        ])
        .slice(startValue, endValue)
        .sort({
            id: .1
        })
        .getAll()
        .then(prods => {
            if (prods.length > 0) {
                res.status(200).json({
                    count: prods.length,
                    products: prods
                });
            } else {
                res.json({
                    message: `No products found from ${ownerId} ID`
                });
            }
        })
        .catch(err => console.log(err));
});

/* GET ONE USER PROFILE MATCHING ID */
router.get('/profile/:userId', [checkAuth.userToken, checkAuth.verifyTheToken], (req, res) => {
    let userId = req.params.userId;
    helper.database.table('users as u')
        .join([
            {table: "login as l", on: `user_id = userId`},
            {table: "roles as r", on: `roleId = role_id`}
        ])
        .filter({userId: userId})
        .withFields([
            'userId', 'firstName', 'lastName', 'region', 'district', 'phone', 'email',
            'username', 'roleName'
        ])
        .get().then(user => {
        if (user) {
            res.json({
                user: user
            });
        } else {
            res.json({message: `NO USER FOUND WITH ID : ${userId}`});
        }
    }).catch(err => res.json(err));
});

/* UPDATE USER DATA */
// router.patch('/:userId', async (req, res) => {
//     let userId = req.params.userId;     // Get the User ID from the parameter
//
//     // Search User in Database if any
//     let user = await database.table('users').filter({id: userId}).get();
//     if (user) {
//
//         let userEmail = req.body.email;
//         let userPassword = req.body.password;
//         let userFirstName = req.body.fname;
//         let userLastName = req.body.lname;
//         let userUsername = req.body.username;
//         let age = req.body.age;
//
//         // Replace the user's information with the form data ( keep the data as is if no info is modified )
//         database.table('users').filter({id: userId}).update({
//             email: userEmail !== undefined ? userEmail : user.email,
//             password: userPassword !== undefined ? userPassword : user.password,
//             username: userUsername !== undefined ? userUsername : user.username,
//             fname: userFirstName !== undefined ? userFirstName : user.fname,
//             lname: userLastName !== undefined ? userLastName : user.lname,
//             age: age !== undefined ? age : user.age
//         }).then(result => res.json('User updated successfully')).catch(err => res.json(err));
//     }
// });

module.exports = router;
