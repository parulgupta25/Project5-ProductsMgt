const express = require('express')
const route = express.Router()
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
// const cartController = require('../controllers/cartController')
// const orderController = require('../controllers/orderController')

// User APIs
route.post('/register', userController.createUser)
route.post('/login', userController.loginUser)
route.get('/user/:userId/profile', userController.getUser)
route.put('/user/:userId/profile', userController.updateUser)

// Product APIs
route.post('/products', productController.createProduct)
route.get('/products', productController.getProduct)
// route.get('/products/:productId', productController.getProductById)
// route.put('/products/:productId', productController.updateProduct)
// route.delete('/products/:productId', productController.deleteProduct)

// Cart APIs
// route.post('/users/:userId/cart', cartController.createCart)
// route.put('/users/:userId/cart ', cartController.updatCart)
// route.get('/users/:userId/cart', cartController.getCartById)
// route.delete('/users/:userId/cart', cartController.deleteCart)

// Order APIs
// route.post('/users/:userId/orders', orderController.createOrder)
// route.put('/users/:userId/orders ', orderController.updatOrder)

module.exports = route