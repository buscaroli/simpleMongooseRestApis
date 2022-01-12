const mongoose = require('mongoose')
const databaseName = 'notes-manager'

// To check if local DB is running try
// ps aux | grep -v grep | grep mongod
mongoose.connect('mongodb://127.0.0.1:27017/' + databaseName, {
    useNewUrlParser: true
})

