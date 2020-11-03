const express = require('express');
const router = express.Router();
const {database} = require('../config/helpers');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');

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

//RETURN PRODUCT IMAGE
// router.get('/image/:prodImage', (req, res) => {
//     let productImage = req.params.prodImage;
//     let imgUrl = '../frontend/src/assets/img/products/'
//     res.download(imgUrl + productImage);
// })

const store = multer.diskStorage({
    destination: '../frontend/src/assets/img/products',
    filename: function (req, file, callback) {
        return callback(null, `${file.originalname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: store,
    // limits: {
    //     fileSize: 100000
    // }
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

// GET PRODUCT BELONG TO USER
router.get('/user/:userId', (req, res) => {
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
    const ownerId = req.params.userId;
    database.table('products as p')
        .join([
            {
                table: 'users as u',
                on: `u.userId = p.owner`
            },
            {
                table: 'categories as c',
                on: 'c.categoryId = p.category'
            }
        ])
        .filter({'p.owner': ownerId})
        .withFields([
            'c.name as category',
            'p.productName as title', 'p.price', 'p.quantity',
            'p.description', 'p.discount', 'p.image', 'p.productId as id'
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
                res.json({message: `No products found from ${ownerId} ID`});
            }
        })
        .catch(err => console.log(err));
});

// UPLOAD PRODUCT IMAGE
router.post('/image/', upload.single('prodImage'), (req, res) => {
    res.status(201).json({
        fileToUpload: req.file.filename
    });
    // upload(req, res, function (err) {
    //     if (err) {
    //         return res.status(501).json({error: err});
    //     } else {
    //         res.status(201).json({
    //             fileToUpload: req.file.filename
    //         });
    //     }
    // });
});


// TODO: POST PRODUCT
router.post('/new/', (req, res) => {
    console.log(req.body);
    let {productName, price, lifeTime, quantity, image, description, category, owner, discount} = req.body;
    database.table('products')
        .insert({
            productName: productName,
            price: price,
            lifeTime: lifeTime,
            quantity: quantity,
            image: image,
            description: description,
            category: category,
            owner: owner,
            discount: discount
        }).then(lastProdId => {
        if (lastProdId > 0) {
            res.status(201).json({
                success: 1,
                message: 'product Inserted successful.'
            });
        } else {
            res.status(501).json({
                success: 0,
                message: 'product failed.'
            });
        }

    }).catch(err => res.status(433).json({error: err}));
    
});


// PROCESS IMAGE UPLOAD


// TODO: UPDATE PRODUCT

// TODO: DELETE PRODUCT


module.exports = router;
