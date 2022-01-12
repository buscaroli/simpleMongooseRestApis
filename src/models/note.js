import mongoose from 'mongoose'
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
    author: {
        type: String,
        trim: true
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

 export default Note