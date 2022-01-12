import express from 'express'
const router = new express.Router()


router.post('/notes', (req, res) => {
    const note = new Note(req.body)

    note.save()
        .then(() => {
            res.send(note)
        })
        .catch((err) => {
            res.send(err)
        })
})

export default router