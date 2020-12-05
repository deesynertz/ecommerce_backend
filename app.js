const express = require('express');
require('dotenv').config();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const app = express();


/* CORS */
app.use(cors({
    origin: '*',
    methods: ['GET', 'PUT', 'DELETE', 'PATCH', 'POST'],
    allowedHeaders: 'Content-Type, Authorization, Origin, X-Requested-With, Accept'
}));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Import Routes
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const orderRouter = require('./routes/orders');
const paymentRout = require('./routes/payment');
const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');


// Define Routes
/**
 * @swagger
 * /api/products:
 *   get:
 *    description: Get All Products
 *
 */

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/orders', orderRouter);
app.use('/api/payment', paymentRout);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);

module.exports = app;
