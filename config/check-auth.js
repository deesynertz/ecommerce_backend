const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

module.exports = {
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
    },

//     sendVerficationEmail: async (req, res, next) => {
//         // async..await is not allowed in global scope, must use a wrapper

//     // Generate test SMTP service account from ethereal.email
//     // Only needed if you don't have a real mail account for testing
//     let testAccount = await nodemailer.createTestAccount();
  
//     // create reusable transporter object using the default SMTP transport
//     let transporter = nodemailer.createTransport({
//       host: "smtp.ethereal.email",
//       port: 587,
//       secure: false, // true for 465, false for other ports
//       auth: {
//         user: testAccount.user, // generated ethereal user
//         pass: testAccount.pass, // generated ethereal password
//       },
//     });
  
//     // send mail with defined transport object
//     let info = await transporter.sendMail({
//       from: '"Fred Foo 👻" <foo@example.com>', // sender address
//       to: "bar@example.com, baz@example.com", // list of receivers
//       subject: "Hello ✔", // Subject line
//       text: "Hello world?", // plain text body
//       html: "<b>Hello world?</b>", // html body
//     });
  
//     console.log("Message sent: %s", info.messageId);
//     // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
//     // Preview only available when sending through an Ethereal account
//     console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
//     // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
//   }
  
//   sendVerficationEmail().catch(console.error);
//     }


}


// jwt.verify(req.token, `${helper.secret}`, (error, authData) => {
//     if (error) {
//         res.json({statusCode: res.statusCode, message: "Token Expired"});
//     } else {
//         all logic
//     }
//  });

// try {
//     req.authData = jwt.verify(token, process.env.SECRET_CODE);
//     next();
// } catch (error) {
//     return res.status(401).json({
//         message: 'Auth Failed'
//     })
// }
// next();
