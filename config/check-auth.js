const jwt = require('jsonwebtoken');
const {database} = require('./helpers');


const StripeSecretKey = process.env.STRIPE_SECRET_KEY;


module.exports = {
    stripeSecretKey: StripeSecretKey,

    userToken: (req, res, next) => {
        // Get auth header value
        const bearerHeader = req.headers['authorization'];
        // Check if bearer if undefined
        if (typeof bearerHeader !== 'undefined') {
            // Split at the space
            // const bearer = bearerHeader.split(' ');
            // Get token from array & Set the token
            // req.token = bearer[1];
            req.token = bearerHeader.split(' ')[1];
            // Next middleware
            next();
        } else {
            // Forbidden {just send 433 status}
            res.status(433).json({
                statusMesage: "Forbidden"
            })
        }

    },
    
    verifyTheToken: (req, res, next) => {
        jwt.verify(req.token, process.env.SECRET_CODE,
            (error, authData) => {
                if (error) {
                    res.json({statusCode: res.statusCode, message: "Token Expired"});
                } else {
                    next();
                }
            });
    },

    checkEmailAuth: async (req, res, next) => {
        await database.table('users')
        .withFields(['email','verifiedEmail'])
        .filter({$or: [{email: req.body.email}]}).get()
        .then(foundEmail => {
            if (foundEmail) {
                if (foundEmail.verifiedEmail === 1){
                    next();
                }else{
                    res.json({
                        success: false,
                        message: "Verify Your Email before login"
                    });
                }
            }else{
                res.json({
                    success: false,
                    message: "Email Not found"
                });
            }
        })
        .catch(err => console.log(err))
    },

    checkEmailExist: async (req, res, next) => {
        await database.table('users')
        .withFields(['email'])
        .filter({email: req.body.email})
        .get()
        .then(foundEmail => {
            if (!foundEmail) {
                next();
            }else{
                res.json({
                    success: false,
                    message: `Email (${req.body.email}) Connected with another account`
                });
            }
        }).catch(err => console.log(err))
    }
}


