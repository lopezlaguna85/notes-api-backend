require('dotenv').config()
require('./mongo.js')

const express = require('express')
const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const app = express()
const cors = require('cors')

const notFound = require('./middleware/notFound.js')
const handleErrors = require('./middleware/handleErrors.js')
const usersRouter = require('./controllers/users')
const notesRouter = require('./controllers/notes')
const loginRouter = require('./controllers/login')
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

app.use('/notes', notesRouter)

app.use('/users', usersRouter)

app.use('/login', loginRouter)

app.use(notFound)
app.use(Sentry.Handlers.errorHandler())
app.use(handleErrors)

const PORT = process.env.PORT

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = { app, server }
