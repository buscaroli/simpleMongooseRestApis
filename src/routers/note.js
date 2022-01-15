const express = require('express')
const Note = require('../models/note')
const auth = require('../middleware/auth')

const router = new express.Router()

// CRUD: CREATE
router.post('/notes', auth, (req, res) => {
    const note = new Note({
        ...req.body,
        writtenBy: req.author._id
    })

    note.save()
        .then(() => {
            res.status(201).send(note)
        })
        .catch((err) => {
            res.status(500).send(err)
        })
})

// CRUD: READ all notes by authorised author
router.get('/notes', auth, (req, res) => {
    const writtenBy = req.author._id
    
    Note.find({ writtenBy })
        .then(notes => {
            res.send(notes)
        })
        .catch(err => {
            res.status(500).send(err)
        })
})


// CRUD: READ One Note from authorized author
router.get('/notes/:id', auth, (req, res) => {
    const _id = req.params.id
    const writtenBy = req.author._id
    
    Note.findOne({ _id, writtenBy })
    .then(note => {
        if (!note) {
            return res.status(404).send()
        }
        res.send(note)
    })
    .catch(err => {
        res.status(500).send(err)
    })
})

// CRUD: UPDATE one
router.patch('/notes/:id', auth, async (req, res) => {
    const _id = req.params.id
    const writtenBy = req.author._id
    console.log(`noteID: ${_id}`)
    console.log(`writtenBy: ${writtenBy}`)

    const updates =  Object.keys(req.body)
    const allowedUpdates = ['title', 'text', 'read']
    const isValidOperation = updates.every(update => {
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({ err: 'Trying to update protected field(s).'})
    }

    try {
        const note = await Note.findOne({ _id, writtenBy })
        // console.log(`note: ${note.title} author: ${note.author}`)
        
        if (!note) {
            return res.status(404).send()
        }

        updates.forEach(update => note[update] = req.body[update])
        await note.save()
        res.send(note)

    } catch (err) {
        res.status(400).send(err)
    }
})


// CRUD: DELETE one note by Authorised Author
router.delete('/notes/:id', auth, (req, res) => {
    const _id = req.params.id
    const writtenBy = req.author._id

    Note.findByIdAndDelete({ _id, writtenBy })
        .then(note => {
            if (!note) {
                return res.status(404).send()
            }
            res.send(note)
        })
        .catch(err => {
            res.status(500).send(err)
        })
    })


module.exports = router