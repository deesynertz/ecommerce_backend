const Mysqli = require('mysqli');
const bcrypt = require('bcrypt');

let conn = new Mysqli({
    Host: process.env.HOST_SERVER, // IP/domain name
    post: process.env.DB_PORT, // port, default 3306
    user: process.env.USER_NAME, // username
    passwd: process.env.DB_PASSWORD, // password
    db: process.env.DB_NAME
});

let db = conn.emit(false, '');

module.exports = {
    database: db,
    secret: process.env.SECRET_CODE,
    loadDataInPage: (req, res, next) => {
        let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;
        const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10; // set limit of items per page
        let startValue;
        let endValue;
        if (page > 0) {
            startValue = (page * limit) - limit; // 0, 10, 20, 30
            endValue = page * limit; // 10, 20, 30, 40
        } else {
            startValue = 0;
            res.endValue = 10;
        }
        next();

    }
}
