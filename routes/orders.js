const express = require('express');
const router = express.Router();
const {database} = require('../config/helpers');

/* GET ALL ORDER  */
router.get('/', function (req, res) {
    database.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'product as p',
                on: 'p.productid = od.item'
            },
            {
                table: 'customer as cu',
                on: 'cu.customerid = o.buyer'
            }
        ])
        .withFields([
            'cu.customerid as cid', 'cu.lastName',
            'p.productid as pid', 'p.productName as title', 'p.price', 'p.quantity', 'p.description', 'p.image',
            'o.orderDate', 'o.id as id',
            'od.quantity'
        ])
        .sort({id: 1})
        .getAll()
        .then(orders => {
            if (orders.length > 0) {
                res.status(200).json(orders);
            } else {
                res.json({message: 'No Order Found'});
            }
        })
        .catch(err => console.log(err));
});

/* GET A SINGLE ORDER */
router.get('/:oid', (req, res) => {
    const orderId = req.params.oid;
    database.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'products as p',
                on: 'p.productId = od.item'
            },
            {
                table: 'users as u',
                on: 'u.userId = o.buyer'
            }
        ])
        .withFields([
            'u.userId as uid', 'u.lastName',
            'p.productId as pid', 'p.productName as title', 'p.price', 'p.quantity', 'p.description', 'p.image',
            'o.orderDate', 'o.id as id',
            'od.quantity'
        ])
        .filter({'o.id': orderId})
        .getAll()
        .then(orders => {
            if (orders.length > 0) {
                res.status(200).json(orders);
            } else {
                res.json({message: `No Order Found with order ID ${orderId}`});
            }
        })
        .catch(err => console.log(err));
});

/* PLACE A NEW ORDER */
router.post('/new', (req, res) => {

    let {customerId, products} = req.body;

    if (customerId !== null && customerId > 0 && !isNaN(customerId)) {
        database.table('orders')
            .insert({
                buyer: customerId
            }).then(newOrderId => {

            if (newOrderId > 0) {
                products.forEach(async (p) => {
                    let data = await database.table('products').filter({productId: p.id}).withFields(['quantity']).get();
                    let inCart = p.incart;

                    //deduct the number of quantity after order placed in product column
                    if (data.quantity > 0) {
                        data.quantity = data.quantity - inCart;
                        if (data.quantity < 0) {
                            data.quantity = 0;
                        }
                    } else {
                        data.quantity = 0;
                    }

                    // INSERT ORDER DETAILS WITH RESPECT TO THE NEWLY GENERATED ORDER ID
                    database.table('orders_details')
                        .insert({order_id: newOrderId, item: p.id, quantity: inCart})
                        .then(newID => {
                            database.table('products').filter({productId: p.id})
                                .update({quantity: data.quantity})
                                .then(successNum => {
                                })
                                .catch(err => console.log(err));
                        }).catch(err => console.log(err));
                });
            } else {
                res.json({message: 'new order fails while adding order details', success: false})
            }
            res.json({
                message: `new order successfully  placed  with order id  ${newOrderId}`,
                success: true,
                order_id: newOrderId,
                products: products
            });
        }).catch(err => console.log(err));
    } else {
        res.json({message: 'new order fails', success: false})
    }
    // console.log(customerId, products);
});

/* FAKE PAYMENT */
router.post('/payment', (req, res) => {
    setTimeout(() => {
        res.status(200).json({success: true});
    }, 3000);
});

module.exports = router;
