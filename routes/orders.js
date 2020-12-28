const express = require('express');
const router = express.Router();
const helper = require('../config/helpers');
const checkAuth = require('../config/check-auth');


/* GET ALL ORDER  
    remember to create an interceptor fo admin recognition 
*/

router.get('/',[checkAuth.userToken, checkAuth.verifyTheToken], (req, res) =>{
    helper.database.table('orders_details as od')
    .join([
        {table: 'orders as o', on: 'o.orderId = od.order_id'},
        {table: 'products as p', on: 'p.productId = od.item'},
        {table: 'users as u', on: 'u.userId = o.buyer'}
    ])
    .withFields([
        'u.userId as uid', 'u.lastName',
        'p.productId as pid', 'p.productName as title', 'p.price', 'p.quantity', 'p.description', 'p.image',
        'o.orderDate', 'orderId as oid',
        'od.quantity'
    ])
    .sort({oid: 1})
    .getAll()
    .then(orders => {
        if (orders.length > 0) {
            res.status(200).json(orders);
        } else {
            res.json({
                message: 'No Order Found'
            });
        }
    })
    .catch(err => console.log(err));
});

/* GET A SINGLE ORDER */
router.get('/:oid', [checkAuth.userToken, checkAuth.verifyTheToken], async (req, res) => {
    const orderId = req.params.oid;
    helper.database.table('orders_details as od')
        .join([
            {table: 'orders as o', on: 'o.orderId = od.order_id'},
            {table: 'products as p',on: 'p.productId = od.item'},
            {table: 'users as u',on: 'u.userId = o.buyer'}
        ])
        .withFields([
            'u.userId as uid', 'u.lastName',
            'p.productId as pid', 'p.productName as title', 'p.price', 'p.quantity', 'p.description', 'p.image', 'p.discount',
            'o.orderDate', 'o.orderId as id',
            'od.quantity'
        ])
        .filter({'o.orderId': orderId})
        .getAll()
        .then(orders => {
            if (orders.length > 0) {

                helper.database.table('orders')
                .withFields(['total']).filter({'orderId': orderId})
                .get()
                .then(orderTotal => {
                    res.status(200).json({
                        orders,
                        orderTotal: orderTotal.total,
                    });
                })
                .catch(err => console.log(err));

                
                
                
            } else {
                res.json({message: `No Order Found with order ID ${orderId}`});
            }
        })
        .catch(err => console.log(err));
});

/* PLACE A NEW ORDER */
router.post('/create', [checkAuth.userToken, checkAuth.verifyTheToken], (req, res) => {

    let {customerId, totalAmount, products} = req.body;

    if (customerId !== null && customerId > 0 && !isNaN(customerId)) {
        helper.database.table('orders').insert({buyer: customerId, total: totalAmount}).then(newOrderId => {
            if (newOrderId > 0) {
                products.forEach(async (p) => {
                    let data = await helper.database.table('products')
                        .filter({productId: p.id})
                        .withFields(['quantity'])
                        .get();
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
                    helper.database.table('orders_details')
                        .insert({order_id: newOrderId, item: p.id, quantity: inCart}).then(newID => {
                        helper.database.table('products').filter({productId: p.id}).update({
                            quantity: data.quantity
                        }).then(successNum => {
                        }).catch(err => console.log(err));
                    }).catch(err => console.log(err));
                });
            } else {
                res.json({
                    success: false,
                    message: 'new order fails while adding order details'
                })
            }
            res.json({
                success: true,
                message: `new order successfully  placed  with order id  ${newOrderId}`,
                order_id: newOrderId,
                products: products
            });
        }).catch(err => console.log(err));
    } else {
        res.json({
            success: false,
            message: 'new order fails'
        })
    }
    console.log(customerId, products);
});

// ALL ORDER BELONG TO SELLER
router.get('/seller/:id', [checkAuth.userToken, checkAuth.verifyTheToken], (req, res) => {
    // TODO: check is your token
    const ownerId = req.params.id;
    helper.database.table('orders_details as od')
    .join([
        {table: 'orders as o', on: 'o.orderId = od.order_id'},
        {table: 'products as p', on: 'p.productId = od.item'},
        {table: 'users as u', on: 'u.userId = o.buyer'}
    ])
    .filter({'p.owner': ownerId})
    .withFields([
        'u.userId as buyerId', 'u.lastName',
        'p.productid as pid', 'p.productName as title', 'p.discount', 'p.price', 'p.quantity', 'p.description', 'p.image',
        'o.orderDate', 'orderId as id',
        'od.quantity as odQuantity',
    ])
    .sort({id: 1})
    .getAll()
    .then(orders => {
        if (orders.length > 0) {
            res.status(200).json({
                count: orders.length,
                products: orders,
            });
        } else {
            res.json({message: 'No Order Found'});
        }
    })
    .catch(err => console.log(err));
})

// ALL ORDER BELONG TO BUYER
router.get('/buyer/:id', [checkAuth.userToken, checkAuth.verifyTheToken], (req, res) => {
    // TODO: check is your token
    const buyerId = req.params.id;
    helper.database.table('orders as o')
    .filter({'buyer': buyerId})
    .withFields(['orderId as id', 'orderDate', 'buyer', 'status'])
    .sort({orderId: 1})
    .getAll()
    .then(orders => {
        if (orders.length > 0) {
            res.status(200).json({
                count: orders.length,
                orders: orders
            });
        } else {
            res.json({
                count: orders.length,
                message: 'No Order Found'
            });
        }
    })
    .catch(err => console.log(err));
})

module.exports = router;
