const connectToMongo = require('./db');
const express = require('express');
const mongoose = require("mongoose");


const app = express()
const port = 5000

app.use(express.json()) // This line will help us to send the request in JSON format.

// Available Routes

app.use('/api/auth',require('./routes/auth'))
app.use('/api/note',require('./routes/notes'))

app.get('/', (req, res) => {
    res.send('Hello World!')
    connectToMongo();
})

app.listen(port, async () => {
    connectToMongo(); // Establishing the connection to the DB here.
  console.log(`Example app listening on port ${port}`)
})