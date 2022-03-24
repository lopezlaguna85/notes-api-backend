const supertest = require('supertest')
const { app } = require('../index.js')
const User = require('../models/User')

const initialNotes = [
  {
    content: 'Hola Oscar',
    important: true,
    date: new Date()
  },
  {
    content: 'Que tal?',
    important: true,
    date: new Date()
  },
  {
    content: 'Es viernes',
    important: true,
    date: new Date()
  }
]

const api = supertest(app)

const getAllContentFromNotes = async () => {
  const response = await api.get('/notes')

  return {
    contents: response.body.map(note => note.content),
    response: response
  }
}

const getAllUsers = async () => {
  const usersDB = await User.find({})
  const users = usersDB.map(user => user.toJSON())

  return users
}

module.exports = {
  initialNotes,
  api,
  getAllContentFromNotes,
  getAllUsers
}
