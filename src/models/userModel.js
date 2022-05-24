const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    fname: { type: String, required: true, trim: true },
    lname: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    profileImage: { type: String, required: true, trim: true }, // s3 link
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 8, maxlength: 15, trim: true }, // encrypted password
    address: {
        shipping: {
        street: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        pincode: { type: Number, required: true, trim: true }
        },
        billing: {
        street: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        pincode: { type: Number, required: true, trim: true }
        }
    }
}, { timestamps: true });

// create a model from schema and export it
module.exports = mongoose.model('User', userSchema);