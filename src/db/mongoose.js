const mongoose = require('mongoose')
const databaseName = 'notes-manager'

// To check if local DB is running try
// ps aux | grep -v grep | grep mongod
mongoose.connect(process.env.DB_HOST + databaseName, {
    useNewUrlParser: true
})

