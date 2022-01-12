const express = require('express')
require('./db/mongoose')
const Note = require ('./models/note')

const noteRouter = require('./routers/note')
const port = process.env.PORT || 3000
const app = express()
app.use(express.json())
app.use(noteRouter)


// Starting server
app.listen(port, () => {
    console.log(`Server running on port ${port}...`)
})