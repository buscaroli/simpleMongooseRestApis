const express = require('express')
const Author = require('../models/author')
const auth = require('../middleware/auth')
const router = new express.Router()


// LOGIN (Authentication)
router.post('/authors/login', async (req, res) => {
    try {
        const author = await Author.findByEmailAndPassword(req.body.email, req.body.password)
        const token = await author.generateJWToken()
        console.log(author.getPublicProfile())
        const publicProfile = await author.getPublicProfile()
        res.send({ author: publicProfile, token })
    } catch (err) {
        res.status(400).send(err)
    }
    
})


// SIGN UP (CREATE Author)
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


// GET Authorised author's details
router.get('/authors/me', auth, async (req, res) => {
    res.send(req.author)
})


// Update Authorised User
router.patch('/authors/me', auth, async (req, res) => {
    const _id = req.params.id
    
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'age', 'password']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) { 
        return res.status(400).send({ error: 'Trying to update protected field(s).' })
    }
    
    try {
        updates.forEach(update => {
            req.author[update] = req.body[update]
        })

        await req.author.save()
        const publicProfile = await req.author.getPublicProfile()
        res.send(publicProfile)

    } catch (err) {
        res.status(400).send(err)
    }
})


// Delete Authenticated author
router.delete('/authors/me', auth, (req, res) => {
    const _id = req.author._id

    Author.findByIdAndDelete(_id)
        .then(author => {
            const profile = author.getPublicProfile()
            return profile
        })
        .then(profile => {
            req.author.remove()
            return profile
        })
        .then(profile => {
            res.send({author: profile})
        })
        .catch(err => {
            res.status(500).send(err)
        })
})


module.exports = router