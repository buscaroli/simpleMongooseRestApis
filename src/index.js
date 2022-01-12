import express from 'express'
import "./db/mongoose.js"
import Note from './models/note.js'
const port = process.env.PORT || 3000

const app = express()

app.use(express.json())


app.post('/notes', (req, res) => {
    const note = new Note(req.body)

    console.log(note)
})


// Starting server
app.listen(port, () => {
    console.log(`Server running on port ${port}...`)
})