const express = require('express');
const app = express()
const cors = require("cors");
const dotenv = require('dotenv')
dotenv.config()


// const uri = process.env.MONGODB_URI;
const port = process.env.PORT;
// const uri = process.env.MONGODB_URI;
// 1: allow to run in all side
app.use(cors());
// 2: convert json string into json perse
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})