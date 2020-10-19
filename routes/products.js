const express = require('express');
const router = express.Router();
const {database} = require('../config/helpers');

/* GET ALL PRODUCTS */
router.get('/', (req, res) => {
    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10;   // set limit of items per page
    let startValue;
    let endValue;
    if (page > 0) {
        startValue = (page * limit) - limit;     // 0, 10, 20, 30
        endValue = page * limit;                  // 10, 20, 30, 40
    } else {
        startValue = 0;
        endValue = 10;
    }
    database.table('products as p')
        .join([
            {
                table: "categories as c",
                on: `c.categoryId = p.category`
            }
        ])
        .withFields([
            'c.name as category',
            'p.productName as title',
            'p.price',
            'p.quantity',
            'p.discount',
            'p.description',
            'p.image',
            'p.productId as id'
        ])
        .slice(startValue, endValue)
        .sort({id: .1})
        .getAll()
        .then(prods => {
            if (prods.length > 0) {
                res.status(200).json({
                    count: prods.length,
                    products: prods
                });
            } else {
                res.json({message: "No products found"});
            }
        })
        .catch(err => console.log(err));
});

/* GET ONE PRODUCT*/
router.get('/:prodId', (req, res) => {
    let productId = req.params.prodId;
    database.table('products as p')
        .join([
            {
                table: "categories as c",
                on: 'c.categoryId = p.category'
            }
        ])
        .withFields([
            'c.name as category',
            'p.productName as title',
            'p.price',
            'p.quantity',
            'p.description',
            'p.image',
            'p.discount',
            'p.productId as id'
        ])
        .filter({'p.productId': productId})
        .get()
        .then(prod => {
            if (prod) {
                res.status(200).json(prod);
            } else {
                res.json({message: `No product found with product id ${productId}`});
            }
        })
        .catch(err => console.log(err));
});

/* ALL PRODUCT FROM AN PARTICULAR CATEGORY*/
router.get('/category/:catName', (req, res) => {
    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10;   // set limit of items per page
    let startValue;
    let endValue;
    if (page > 0) {
        startValue = (page * limit) - limit;     // 0, 10, 20, 30
        endValue = page * limit;                  // 10, 20, 30, 40
    } else {
        startValue = 0;
        endValue = 10;
    }
    const productType_Name = req.params.catName;
    database.table('products as p')
        .join([
            {
                table: 'categories as c',
                on: `c.categoryId = p.category WHERE c.name LIKE '%${productType_Name}%'`
            }
        ])
        .withFields([
            'c.name as category',
            'p.productName as title',
            'p.price',
            'p.quantity',
            'p.description',
            'p.discount',
            'p.image',
            'p.productId as id'
        ])
        .slice(startValue, endValue)
        .sort({id: .1})
        .getAll()
        .then(prods => {
            if (prods.length > 0) {
                res.status(200).json({
                    count: prods.length,
                    products: prods
                });
            } else {
                res.json({message: `No products found from ${productType_Name} category`});
            }
        })
        .catch(err => console.log(err));
});


// TODO: POST PRODUCT

// TODO: UPDATE PRODUCT

// TODO: DELETE PRODUCT


module.exports = router;
