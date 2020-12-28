const express = require('express');
const router = express.Router();
const helper = require('../config/helpers');
const checkAuth = require('../config/check-auth');
const stripeSecretKey = checkAuth.stripeSecretKey;
const stripe = require('stripe')(stripeSecretKey)


/* FAKE OFFLINE */
router.post('/new-offline',[checkAuth.userToken, checkAuth.verifyTheToken], async (req, res) => {
    const amount  = req.body.amount;
    const orderNumber = req.body.orderNumber
    const token   = req.body.token;
    // stripeID = charge.source.id;

    helper.database.table('payment')
    .insert({order_id: orderNumber, amount: amount, stripe_id: token})
    .then(newID => {
        helper.database.table('orders')
        .filter({orderId: orderNumber})
        .update({status: 1}).then(successNum => { 

            charge = {
                description: 'Vegetables & Fruits',
                brand: 'VISA',
                last4: '422',
                name: req.body.name
            }
            if(successNum){
                res.json({
                    success: true,
                    message: "payment done",
                    charge: charge
                })
            }else {
                res.json({
                    success: false,
                    message: 'error to update order status'
                })
            }
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
})

/* FAKE PAYMENT USING STRIPE */
router.post('/new-online',[checkAuth.userToken, checkAuth.verifyTheToken], async (req, res) => {
    const orderNumber = req.body.orderNumber
    const amount = req.body.amount;
    const token = req.body.token;
    const charge = await stripe.charges.create({
        amount: amount,
        currency: 'usd',
        description: 'Vegetables & fruits',
        source: token,
        metadata: {order_id: orderNumber},
    }, (err, charge) => {
        if (err) {
            res.json({
                success: false,
                message: `${err}`
            });
        } else {
            stripeID = charge.id;
            helper.database.table('payment')
            .insert({order_id: orderNumber, amount: amount, stripe_id: stripeID})
            .then(newID => {
                helper.database.table('orders')
                .filter({orderId: orderNumber})
                .update({status: 1}).then(successNum => { 
                    if(successNum){
                        console.log(charge);
                        res.json({
                            success: true,
                            message: "payment done",
                            charge: charge
                        })
                    }else {
                        res.json({
                            success: false,
                            message: 'error to update order status'
                        })
                    }
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));
        }
    });

});

/* REFUND BUYER */


module.exports = router;