const express = require('express')
const Author = require('../models/author')

const router = new express.Router()



// CREATE
// HTTPie:
//      SUCCESS: http --raw '{"name": "Matt", "email": "matt@email.com", "age": 43, "password": "qwertyuiop"}' POST localhost:3000/authors
//      FAILURE: http --raw '{"name": "MB", "email": "mb@edc.co", "age": 43, "password": "qwaszx"}' POST localhost:3000/authors
router.post('/authors', (req, res) => {
    const author = new Author(req.body)

    author.save()
        .then(() => {
            res.send(author)
        })
        .catch(err => {
            res.status(500).send(err)
        })
})


// READ all
// HTTPie:
//      SUCCESS: http GET localhost:3000/authors
router.get('/authors', (req, res) => {
    Author.find({})
    .then(authors => {
        if (authors.length != 0) {
            return res.send(authors)
        }
        res.status(404).send()
    })
    .catch(err => {
        res.status(500).send(err)
    })
})

// READ one
// HTTPie:
//      SUCCESS: http GET localhost:3000/authors/61df2cf787a0da4731623d7b (<- id from database)
//      FAILURE: http GET localhost:3000/authors/61df2cf787a0da4731623d7A (<- last char changed)
//      FAILURE: http GET localhost:3000/authors/12345 
router.get('/authors/:id', (req, res) => {
    const _id = req.params.id
    
    Author.findById({ _id })
        .then(author => {
            if (!author) {
                return res.status(404).send()
            }
            res.send(author)
        })
        .catch(err => {
            res.status(500).send(err)
        })
})


// Update One
// HTTPie:
//      SUCCESS: http --raw  '{"name": "Matteo"}' PATCH localhost:3000/authors/61dffe7b495f666c8361e055 ( <- id from database)
//      FAILURE: http --raw  '{"name": "Matteo"}' PATCH localhost:3000/authors/61dffe7b495f666c8361e05A (last char changed)
//      FAILURE: http --raw  '{"name": "Matteo"}' PATCH localhost:3000/authors/12345
router.patch('/authors/:id', async (req, res) => {
    const _id = req.params.id
    
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'age', 'password']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) { 
        return res.status(400).send({ error: 'Trying to update protected field(s).' })
    }
    
    try {
        const author = await Author.findById(_id)

        updates.forEach(update => {
            author[update] = req.body[update]
        })

        await author.save()

        if (!author)  {
            return res.status(404).send()
        }
        res.send(author)

    } catch (err) {
        res.status(400).send(err)
    }

    // 2. This version works but doesn't send back the updated author
    // 
    // Author.findById(_id)
    //     .then(author => {
    //         if (!author) {
    //             return res.status(404).send()
    //         }
    //         Author.updateOne({ _id: author._id }, req.body, { new: true, runValidators: true } )
    //             .then(updatedAuthor => {
    //                 res.send()
    //             })
    //     })
    //     .catch(err => {
    //         res.status(500).send(err)
    //     })

    // 1. !!!! findByIdAndUpdate doesn't work with Moddleware !!!!
    // 
    // Author.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
    //     .then(author => {
    //         if (!author) {
    //             return res.status(404).send()
    //         }
    //         res.send(author)
    //     })
    //     .catch(err => {
    //         res.status(500).send(err)
    //     })
})

// Delete One
// HTTPie:
//      SUCCESS: http DELETE localhost:3000/authors/61dffe7b495f666c8361e055 (<- id from database)
//      FAILURE: Do the above again for a 404
//      FAILURE: http DELETE localhost:3000/authors/12345
router.delete('/authors/:id', (req, res) => {
    const _id = req.params.id

    Author.findByIdAndDelete(_id)
        .then(author => {
            if (!author) {
                return res.status(404).send()
            }
            res.send(author)
        })
        .catch(err => {
            res.status(500).send(err)
        })
})

// AUTHORIZATION
// HTTPie:
//      SUCCESS: http --raw  '{"email": "julian@email.com", "password": "qwe123"}' POST localhost:3000/authors/login (<- info from DB)
//      FAILURE: http --raw  '{"email": "julian@email.com", "password": "qwe"}' POST localhost:3000/authors/login (alter mail or pw)
router.post('/authors/login', async (req, res) => {
    try {
        const author = await Author.findByEmailAndPassword(req.body.email, req.body.password)
        res.send(author)
    } catch (err) {
        res.status(400).send()
    }
    
})


module.exports = router