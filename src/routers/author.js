const express = require('express')
const Author = require('../models/author')
const auth = require('../middleware/auth')
const router = new express.Router()



// LOGIN (Authentication)
router.post('/authors/login', async (req, res) => {
    try {
        const author = await Author.findByEmailAndPassword(req.body.email, req.body.password)
        const token = await author.generateJWToken()
        res.send({ author, token })
    } catch (err) {
        res.status(400).send(err)
    }
    
})

// SIGN UP (CREATE Author)
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

// LOGOUT (Authentication)
// Just logout on the device you are using
router.post('/authors/logout', auth, async (req, res) => {
    try {
        req.author.tokens = req.author.tokens.filter( token => {
            return token.token !== req.token
        })
        await req.author.save()

        res.send()
    } catch (err) {
        res.status(500).send(err)
    }
})

// LOGOUT FROM ALL DEVICES (wipeout tokens)
router.post('/authors/logoutAll', auth, async (req, res) => {
    try {
        req.author.tokens = []
        await req.author.save()
        
        res.send()
    } catch (err) {
        res.status(500).send(err)
    }
})


// READ all
// HTTPie:
//      SUCCESS: http GET localhost:3000/authors
router.get('/authors/me', auth, async (req, res) => {
    res.send(req.author)
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


module.exports = router