
const { Schema, model } = require('mongoose')

const noteSchema = new Schema({
  content: String,
  date: Date,
  important: Boolean,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Note = model('Note', noteSchema)

/* Note.find({}).then(res => {
  console.log(res)
  mongoose.connection.close()
}).catch(e => {
  console.error(e)
}) */

/* const note = new Note({
  content: 'Mongo Mola2',
  date: new Date(),
  important: true
})

note.save()
  .then(res => {
    console.log(res)
    mongoose.connection.close()
  }).catch(e => {
    console.error(e)
  }) */

module.exports = Note
