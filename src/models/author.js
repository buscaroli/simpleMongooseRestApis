const mongoose = require('mongoose')
const { Schema } = mongoose
const validator = require('validator')
const { validate } = require('./note')
const bcrypt = require('bcrypt')

const authorSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        validate(value){
            if (value.length < 3) {
                throw new Error('Name must be at least three characters long.')
            }
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        validate(value){
            if (!validator.isEmail(value)) {
                throw new Error('Email non valid.')
            }
        }
    },
    age: {
        type: Number,
        required: false,
        validate(value){
            if (value < 0) {
                value = 0
            }
        },
        default: 0
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    joined: {
        type: Date,
        default: Date.now()
    }
})

// Middleware that encrypt the password BEFORE it's saved to the database
authorSchema.pre('save', async function(next) {
    // this refers to the author being processed
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }

    next() // we need next because this is an async function
})

const Author = mongoose.model('Author', authorSchema)

module.exports = Author