const jwt = require('jsonwebtoken')
const Author = require('../models/author')

// Authentication with JSON Web Tokens
// This function will be called when the client tries to access a route that includes it as a second argument.
// For example:
//             route ->      middleware -> route handler
// router.get('/authors/me', auth,         async (req, res) => {})
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.TOKEN_PASS) // the token contains the _id
        // console.log(decoded)
        const author = await Author.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!author) {
            throw new Error() // triggers the catch
        }
        // adding the two values to the 'req' parameter available in the routes
        req.token = token
        req.author = author

        next()
    } catch (err) {
        res.status(401).send({ error: 'Not authenticated.' })
    }
}

module.exports = auth