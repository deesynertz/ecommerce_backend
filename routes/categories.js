const express = require('express');
const router = express.Router();
const helper = require('../config/helpers');

// GET ALL PRODUCT TYPE
router.get('/', function (req, res) {
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

    helper.database.table('categories')
        .slice(startValue, endValue)
        .sort({categoryId: .1})
        .getAll()
        .then(cats => {
            if (cats.length > 0) {
                res.status(200).json({
                    count: cats.length,
                    categories: cats
                });
            } else {
                res.json({message: "No any Category found"});
            }
        })
        .catch(err => console.log(err));
});

// TODO: POST PRODUCT TYPE 

// TODO: UPDATE PRODUCT TYPE

// TODO: DELETE PRODUCT TYPE

module.exports = router;
