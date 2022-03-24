const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/User')

loginRouter.post('/', async (request, response) => {
  try {
    const { body } = request
    const { username, password } = body

    const user = await User.findOne({ username })
    const passwordCorrect = user === null
      ? null
      : await bcrypt.compare(password, user.passwordHash)

    if (!(user && passwordCorrect)) {
      response.status(401).json({
        error: 'invalid user or password'
      })
    }

    const userForToken = {
      id: user._id,
      username: user.username
    }

    const token = jwt.sign(
      userForToken,
      process.env.SECRET,
      {
        expiresIn: 60 * 60 * 24 * 7
      }
    )

    response.send({
      name: user.name,
      username: user.username,
      token
    })
  } catch (e) {
    response.status(400).json({ e })
  }
})

module.exports = loginRouter
