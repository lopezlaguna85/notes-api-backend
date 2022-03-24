const mongoose = require('mongoose')

const { server } = require('../index.js')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const { api, getAllUsers } = require('./helpers')

describe('creating a new user', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('111', 10)
    const user = new User({
      username: 'prueba1',
      name: 'Manolo',
      passwordHash: passwordHash
    })

    await user.save()
  })

  test('works as expected creating a fresh usename', async () => {
    const usersAtStart = await getAllUsers()

    const newUser = {
      username: 'prueba2',
      name: 'Javier',
      password: 'nueva'
    }

    await api
      .post('/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await getAllUsers()

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username is already created', async () => {
    const usersAtStart = await getAllUsers()

    const newUser = {
      username: 'prueba1',
      name: 'Alberto',
      password: '1234'
    }

    const result = await api
      .post('/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.e.message).toContain('expected `username` to be unique')

    const usersAtEnd = await getAllUsers()

    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  afterAll(() => {
    mongoose.connection.close()
    server.close()
  })
})
