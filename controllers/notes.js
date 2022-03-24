const notesRouter = require('express').Router()
const Note = require('../models/Note')
const User = require('../models/User')
const userExtractor = require('../middleware/userExtractor')

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({}).populate('user', {
    username: 1,
    name: 1
  })
  response.json(notes)
})

notesRouter.get('/:id', (request, response, next) => {
  const { id } = request.params
  Note.findById(id).then(res => {
    if (res) {
      response.json(res)
    } else {
      response.status(404).end()
    }
  }).catch(e => {
    next(e)
  })
})
//
notesRouter.put('/:id', userExtractor, (request, response, next) => {
  const { id } = request.params
  const note = request.body

  const updateNote = {
    content: note.content,
    important: note.important
  }

  Note.findByIdAndUpdate(id, updateNote, { new: true })
    .then(res => {
      response.json(res)
    }).catch(e => next(e))
})

notesRouter.delete('/:id', userExtractor, async (request, response, next) => {
  const { id } = request.params

  try {
    await Note.findByIdAndDelete(id)
    response.status(204).end()
  } catch (e) {
    next(e)
  }
})

notesRouter.post('/', userExtractor, async (request, response, next) => {
  const {
    content,
    important = false
  } = request.body

  const { userId } = request
  const user = await User.findById(userId)

  if (!content) {
    return response.status(400).json({
      error: 'required "content" field is missing'
    })
  }

  const newNote = new Note({
    content,
    date: new Date(),
    important,
    user: user._id
  })

  try {
    const savedNote = await newNote.save()

    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    response.status(201).json(savedNote)
  } catch (e) {
    next(e)
  }
})

module.exports = notesRouter
