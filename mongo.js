
const mongoose = require('mongoose')

const connectionString = process.env.MONGO_DB_URI

// conexion
mongoose.connect(connectionString)
  .then(() => {
    console.log('Database connected')
  }).catch(e => {
    console.error(e)
  })
