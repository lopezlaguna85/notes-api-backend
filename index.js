require('dotenv').config()
require('./mongo.js')

const express = require('express')
const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const app = express()
const cors = require('cors')
const Note = require('./models/Note')

const notFound = require('./middleware/notFound.js')
const handleErrors = require('./middleware/handleErrors.js')
// const userExtractor = require('./middleware/userExtractor')

app.use(cors())
app.use(express.json())
app.use('/images', express.static('images'))

Sentry.init({
  dsn: 'https://7a8e050e6e2e4085af178c878366c8ed@o1164318.ingest.sentry.io/6253319',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app })
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
})

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler())
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler())

app.get('/', (request, response) => {
  response.send('<h1>Hola!!</h1>')
})

app.get('/notes', async (request, response) => {
  const notes = await Note.find({})
  response.json(notes)
})

app.get('/notes/:id', (request, response, next) => {
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

app.put('/notes/:id', (request, response, next) => {
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

app.delete('/notes/:id', async (request, response, next) => {
  const { id } = request.params

  try {
    await Note.findByIdAndDelete(id)
    response.status(204).end()
  } catch (e) {
    next(e)
  }
})

app.post('/notes', async (request, response, next) => {
  const note = request.body

  if (!note.content) {
    return response.status(400).json({
      error: 'required "content" field is missing'
    })
  }

  const newNote = new Note({
    content: note.content,
    date: new Date(),
    important: true
  })

  /*   newNote.save()
    .then(res => {
      response.status(201).json(newNote)
    }).catch(e => {
      next(e)
    }) */

  try {
    const savedNote = await newNote.save()
    response.status(201).json(savedNote)
  } catch (e) {
    next(e)
  }
})

app.use(notFound)
app.use(Sentry.Handlers.errorHandler())
app.use(handleErrors)

const PORT = process.env.PORT

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = { app, server }
