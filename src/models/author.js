const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const { Schema } = mongoose
const validator = require('validator')
const { validate } = require('./note')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const convertDateFormat = require('../utils/dateFormat.js')
const Note = require('./note')

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
    }],
})

// Virtual field removed as not used
// authorSchema.virtual('noteList', {
//     ref: 'Note',
//     localField: '_id',
//     foreignField: 'writtenBy'
// })


// Virtual Method, callable on an instance of Author

// Generate a JSON Web Token
authorSchema.methods.generateJWToken = async function() {
    
    const token = jwt.sign({ _id: this._id.toString() }, process.env.TOKEN_PASS)
    
    this.tokens = this.tokens.concat({ token: token })
    await this.save()

    return token
}

// Create a JSON object without the details that should be kept private
authorSchema.methods.getPublicProfile = async function() {
    stringDate = convertDateFormat(this.joined)
    
    let publicProfile = { name: this.name, email: this.email, joined: stringDate }
    return publicProfile
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

// Delete author's notes if author is deleted
authorSchema.pre('remove', async function (next) {
    await Note.deleteMany({ writtenBy: this._id})

    next()
})

const Author = mongoose.model('Author', authorSchema)

module.exports = Author