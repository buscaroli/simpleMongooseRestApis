const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const { Schema } = mongoose
const validator = require('validator')
const { validate } = require('./note')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

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
        unique: true,
        required: true,
        lowercase: true,
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
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})
// without the following plugin the 'unique' field of Mongoose's Schema
// is ignored as per Jan 2022
// authorSchema.plugin(uniqueValidator)

// Virtual Method, callable on an instance of Author
authorSchema.methods.generateJWToken = async function() {
    
    const token = jwt.sign({ _id: this._id.toString() }, 'mypassword')
    
    this.tokens = this.tokens.concat({ token: token })
    await this.save()

    return token
}


// Static Middleware that finds an author by email and password
// Used for authorization (login)
authorSchema.statics.findByEmailAndPassword = async (email, password) => {
    const author = await Author.findOne({ email })

    if (!author) {
        throw new Error('Unable to login.')
    }

    const isMatch = await bcrypt.compare(password, author.password)

    if (!isMatch) {
        throw new Error('Unable to login.')
    }

    return author
}


// Middleware that hashes the password BEFORE it's saved to the database
authorSchema.pre('save', async function(next) {
    // this refers to the author being processed
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }

    next() // we need next because this is an async function
})

const Author = mongoose.model('Author', authorSchema)

module.exports = Author