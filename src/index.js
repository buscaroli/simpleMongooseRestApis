const express = require('express')
require('./db/mongoose')
const noteRouter = require('./routers/note')
const authorRouter = require('./routers/author')

const port = process.env.PORT || 3000

const app = express()
app.use(express.json())
app.use(noteRouter)
app.use(authorRouter)

// Starting server
app.listen(port, () => {
    console.log(`Server running on port ${port}...`)
})