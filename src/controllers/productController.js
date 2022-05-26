const productModel = require('../models/productModel')
const aws = require('aws-sdk')
const {
    isValid, isValidBody, isValidObjectId, isValidEmail, isValidPhone, isValidPassword, isValidName, isValidPincode, isValidAvailableSizes, isValidPrice
} = require('../validator/validator')
const { is } = require('express/lib/request')

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        let s3 = new aws.S3({ apiVersion: '2006-03-01' })

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "bharat/" + file.originalname,
            Body: file.buffer
        }
        s3.upload(uploadParams, function (err, data) {
            if (err) return reject({ "error": err })
            return resolve(data.Location)
        })
    })
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const createProduct = async (req, res) => {
    try {
        const data = req.body
        if (!isValidBody(data)) return res.status(400).send({ status: false, message: "Invalid Parameters" })
        const { title, description, price, availableSizes } = data
        const currencyId = 'INR'
        const currencyFormat = '₹'

        if (!title) return res.status(400).send({ status: false, message: "title is required" })
        if (!description) return res.status(400).send({ status: false, message: "description is required" })
        if (!price) return res.status(400).send({ status: false, message: "price is required" })
        if (!availableSizes) return res.status(400).send({ status: false, message: "size is required at least one size should be given" })

        if (!isValidName(title)) return res.status(400).send({ status: false, message: "title is invalid" })
        if (!isValid(description)) return res.status(400).send({ status: false, message: "description is invalid" })
        if (!isValidPrice(price)) return res.status(400).send({ status: false, message: "price is invalid" })

        let sizeArray = availableSizes.split(",")
        console.log(sizeArray);
        console.log(typeof sizeArray);
        if (!isValidAvailableSizes(availableSizes)) return res.status(400).send({ status: false, message: `Size should be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })

        const isTitleExist = await productModel.findOne({ title })
        if (isTitleExist) return res.status(400).send({ status: false, message: "Title is already exist" })

        const files = req.files

        if (!(files && files.length > 0)) return res.status(400).send({ status: false, message: "Please provide profile picture" })
        let productPicUrl = await uploadFile(files[0])

        data.productImage = productPicUrl
        data.currencyId = currencyId
        data.currencyFormat = currencyFormat
        const productData = await productModel.create(data)

        return res.status(201).send({ status: true, message: "Success", data: productData })
    }
    catch (err) {
        return res.status(500).send({ Error: err.message })
    }
}

const getProduct = async (req, res) => {
    const filterQuery = { isDeleted: false }
    const queryParams = req.query

    let { size, name, priceGreaterThan, priceLessThan, priceSort } = queryParams
    console.log(queryParams);
    console.log(queryParams.length);

    if (size) {
        if (!isValidAvailableSizes(size)) return res.status(400).send({ status: false, message: `Size should be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
        filterQuery['availableSizes'] = size
    }

    if (name) {
        if (!isValidName(name)) return res.status(400).send({ status: false, message: 'name is invalid' })
        filterQuery['title'] = name
    }

    if (priceGreaterThan && priceLessThan) {
        console.log("both given");
        filterQuery['price'] = { $gte: priceGreaterThan, $lte: priceLessThan }
    }

    if (priceGreaterThan) {
        console.log("only 1 given");
        filterQuery['price'] = { $gte: priceGreaterThan }
    }

    if (priceLessThan) {
        console.log("only 2 given");
        filterQuery['price'] = { $lte: priceLessThan }
    }

    if (priceSort) {
        if (priceSort == 1) {
            const products = await productModel.find(filterQuery).sort({ price: 1 })
            if (!isValidBody(products)) return res.status(404).send({ status: false, message: 'No products found' })
            return res.status(200).send({ status: true, message: 'Success', data: products })
        }
        if (priceSort == -1) {
            const products = await productModel.find(filterQuery).sort({ price: -1 })
            if (!isValidBody(products)) return res.status(404).send({ status: false, message: 'No products found' })
            return res.status(200).send({ status: true, message: 'Success', data: products })
        }
    }

    const products = await productModel.find(filterQuery)
    if (!isValidBody(products)) return res.status(404).send({ status: false, message: 'No products found' })
    return res.status(200).send({ status: true, message: "Success", data: products })
}

module.exports = { createProduct, getProduct }