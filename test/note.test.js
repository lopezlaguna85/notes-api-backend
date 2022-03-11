const mongoose = require('mongoose')

const { server } = require('../index.js')
const Note = require('../models/Note')
const { initialNotes, api, getAllContentFromNotes } = require('./helpers')

beforeEach(async () => {
  await Note.deleteMany({})

  /*
  // Parallel
  const notesObjects = initialNotes.map(note => new Note(note))
  const promises = notesObjects.map(note => note.save())
  await Promise.all(promises)
  */

  // sequential
  for (const note of initialNotes) {
    const noteObject = new Note(note)
    await noteObject.save()
  }
})

describe('GET all notes', () => {
  test('notes are returned as json', async () => {
    await api
      .get('/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('notes are two notes', async () => {
    const response = await api.get('/notes')
    expect(response.body).toHaveLength(initialNotes.length)
  })

  test('1º note about Oscar', async () => {
    const { contents } = await getAllContentFromNotes()

    expect(contents).toContain('Hola Oscar')
  })
})

describe('POST new note', () => {
  test('a valid note can be added', async () => {
    const newNote = {
      content: 'Oscar probando',
      important: true
    }

    await api
      .post('/notes')
      .send(newNote)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const { contents, response } = await getAllContentFromNotes()

    expect(response.body).toHaveLength(initialNotes.length + 1)
    expect(contents).toContain(newNote.content)
  })

  test('note without content is not added', async () => {
    const newNote = {
      important: true
    }

    await api
      .post('/notes')
      .send(newNote)
      .expect(400)

    const response = await api.get('/notes')

    expect(response.body).toHaveLength(initialNotes.length)
  })
})

describe('DELETE a note', () => {
  test('a note can be deleted', async () => {
    const { response: firstResponse } = await getAllContentFromNotes()
    const { body: notes } = firstResponse
    const noteToDelete = notes[0]

    await api
      .delete(`/notes/${noteToDelete.id}`)
      .expect(204)

    const { contents, response: secondResponse } = await getAllContentFromNotes()
    expect(secondResponse.body).toHaveLength(initialNotes.length - 1)
    expect(contents).not.toContain(noteToDelete.content)
  })

  test('a note that do not exist can not be deleted', async () => {
    await api
      .delete('/notes/1234')
      .expect(400)

    const { response } = await getAllContentFromNotes()
    expect(response.body).toHaveLength(initialNotes.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
