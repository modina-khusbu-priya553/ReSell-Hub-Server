const express = require('express');
const app = express()
const cors = require("cors");
const dotenv = require('dotenv')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config()


// const uri = process.env.MONGODB_URI;
const port = process.env.PORT || 5001;


const uri = process.env.MONGODB_URL;
// 1: allow to run in all side
app.use(cors());
// 2: convert json string into json perse
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});


const run = async() =>{
  try {

    // Database collection
    const db = client.db("resell-hub");
    const productCollection = db.collection("products");


    // Connect the client to the server (optional starting in v4.7)
    await client.connect();


     //1:  post for add product

   app.post('/product',async (req, res) => {
      const doc = req.body;
      const result = await productCollection.insertOne(doc);
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    // const result = await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
    // return result;
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})