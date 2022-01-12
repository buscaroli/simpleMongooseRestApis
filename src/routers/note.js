const express = require('express')
const Note = require('../models/note')

const router = new express.Router()

// CRUD: CREATE
// HTTPie: 
//      SUCCESS: http --raw '{"title": "First Note", "text": "This is my first note"}' POST localhost:3000/notes
//      FAILURE: http --raw '{"title": "First Note"}' POST localhost:3000/notes


router.post('/notes', (req, res) => {
    const note = new Note(req.body)

    note.save()
        .then(() => {
            res.send(note)
        })
        .catch((err) => {
            res.status(500).send(err)
        })
})

// CRUD: READ all notes
// HTTPie:
//      http GET localhost:3000/notes 
router.get('/notes', (req, res) => {
    Note.find({})
        .then(notes => {
            res.send(notes)
        })
        .catch(err => {
            res.status(500).send(err)
        })
})

// CRUD: READ one
// HTTPie:
//      SUCCESS: http GET localhost:3000/notes/61dec21f9da8ad3e85a518b3D (<- id from the database)
//      FAILURE: http GET localhost:3000/notes/61dec21f9da8ad3e85a518b3a (last char changed)
//      FAILURE: http GET localhost:3000/notes/12345

router.get('/notes/:id', (req, res) => {
    const _id = req.params.id
    
    Note.findById({_id})
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
// HTTPie:
//      SUCCESS: http --raw  '{"title": "Updated Note", "text": "This is my Updated note"}' 
//          PATCH localhost:3000/notes/61dec26ccf82954c103f16f1 )<- (id from database)
//      FAILURE: http --raw  '{"title": "Updated Note", "text": "This is my Updated note"}' 
//          PATCH localhost:3000/notes/61dec26ccf82954c103f16f2 (last char changed, 404 Not Found)
//      FAILURE: http --raw  '{"title": "Updated Note", "text": "This is my Updated note"}' 
//          PATCH localhost:3000/notes/12345  (400 Bad Request)

router.patch('/notes/:id', (req, res) => {
    const _id = req.params.id

    Note.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
        .then(note => {
            if (!note) {
                return res.status(404).send()
            }
            res.send(note)
        })
        .catch(err => {
            res.status(400).send(err)
        })
})

// CRUD: DELETE one note
//      SUCCESS: http DELETE localhost:3000/notes/61dec21f9da8ad3e85a518b3 )<- id from database)
//      FAILURE: http DELETE localhost:3000/notes/12345 
router.delete('/notes/:id', (req, res) => {
let _id = req.params.id 

Note.findByIdAndDelete({_id})
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