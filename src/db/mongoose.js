import mongoose from 'mongoose'


const databaseName = 'notes-manager'
mongoose.connect('mongodb://127.0.0.1:27017/' + databaseName, {
    useNewUrlParser: true
})

