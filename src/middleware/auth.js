const jwt = require('jsonwebtoken')
const Author = require('../models/author')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'mypassword') // the token contains the _id
        // console.log(decoded)
        const author = await Author.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!author) {
            throw new Error() // triggers the catch
        }

        req.author = author

        next()
    } catch (err) {
        res.status(401).send({ error: 'Not authenticated.' })
    }
}

module.exports = auth