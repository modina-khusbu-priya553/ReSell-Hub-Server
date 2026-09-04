const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const db = client.db("resell-hub");
const productCollection = db.collection("products");

// POST - Add Product
app.post('/product', async (req, res) => {
  try {
    const doc = req.body;

    const result = await productCollection.insertOne(doc);

    res.status(201).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Failed to add product",
      error: error.message
    });
  }
});

// GET - Get Products
app.get('/product', async (req, res) => {
  try {
    const products = await productCollection.find().toArray();

    res.send(products);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Failed to get products",
      error: error.message
    });
  }
});

// Test route
app.get('/', (req, res) => {
  res.send('server is running!');
});

module.exports = app;