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
const secret_Code = "1SBz93MsqTs7KgwARcB0I0ihpILIjk3w";

module.exports = {
    database: db,
    secret: secret_Code,
    isPasswordAndUserMatch: async (req, res, next) => {
        // const myPlaintextPassword = req.body.password;
        // const myUsername = req.body.username;
        //
        // const login_user = await db.table('login').filter({$or: [{username: myUsername}]}).get();
        // if (login_user) {
        //     const match = await bcrypt.compare(myPlaintextPassword, login_user.password);
        //     console.log(login_user.password);
        //     if (match) {
        //         req.username = login_user.username;
        //         next();
        //     } else {
        //         res.status(401).json({
        //             success: 0,
        //             message: "Username or password incorrect"
        //         });
        //     }
        // } else {
        //     res.status(401).json({
        //         success: 0,
        //         message: "Username or password incorrect"
        //     });
        // }
    }
}
