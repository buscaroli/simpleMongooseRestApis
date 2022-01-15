const mongoose = require('mongoose')
const { Schema } = mongoose

const noteSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    writtenBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author'
    },
    date: {
        type: Date,
        default: Date.now()
    },
    read: {
        type: Boolean,
        default: false
    },
    tags: [String]
}) 

const Note = mongoose.model('Note', noteSchema)

module.exports = Note