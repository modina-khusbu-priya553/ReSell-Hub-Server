const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URL;
const port = process.env.PORT;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const run = async () => {

  try {
    const db = client.db("resell-hub");
    const productCollection = db.collection("products");
    const paymentCollection = db.collection("payments");
    const userCollection = db.collection("user");
    const orderCollection = db.collection('orders')

    //1: POST - Add Product
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

    //2: GET - Get Products data
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

    //3: GET - Get seller product by user id
    app.get('/product/seller/:userId', async (req, res) => {
      try {
        const userId = req.params.userId;
        const query = { "sellerInfo.userId": userId }; // note: nested field
        const products = await productCollection.find(query).toArray();
        res.send(products);
      } catch (error) {
        res.status(500).send({ message: "Failed to get products", error: error.message });
      }
    });


    //4: GET - Get Product by ID
    app.get('/product/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const product = await productCollection.findOne(query);
        res.send(product);
      } catch (error) {
        console.error(error);
        res.status(500).send({
          message: "Failed to get product",
          error: error.message
        });
      }
    });

    //5: PATCH - Update Product
    app.patch('/product/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const updatedFields = req.body;
        delete updatedFields._id;
        const requesterId = req.body.requesterId;
        delete updatedFields.requesterId;

        const result = await productCollection.updateOne(
          { _id: new ObjectId(id), "sellerInfo.userId": requesterId },
          { $set: updatedFields }
        );
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: 'Failed to update product' });
      }

    });

    //6: DELETE - Delete Product
    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id;
      const requesterId = req.query.requesterId;
      const query = { _id: new ObjectId(id), "sellerInfo.userId": requesterId };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    //7: post api for payment data from frontend to backend

    app.post("/payment", async (req, res) => {

      try {
        const {
          buyerId,
          buyerName,
          buyerEmail,
          sellerId,
          sellerName,
          sellerEmail,
          productId,
          session_id,
          price,
          quantity,
          title,
          image,
        } = req.body;

        if (!session_id) {
          return res.status(400).send({ message: 'session_id is required' });
        }
        const isExistSession = await paymentCollection.findOne({ session_id });
        if (isExistSession) {
          return res.status(400).send({ message: 'session already exist' })
        }

        //  1: Payment data
        const paymentResult = await paymentCollection.insertOne({
          userId: new ObjectId(user.id),
          buyerEmail,
          buyerId: new ObjectId(buyerId),
          sellerName,
          sellerId,
          sellerEmail,
          productId,
          price: Number(price),
          quantity: Number(quantity),
          title,
          image,
          paymentStatus: 'success',
          paymentDate: new Date(),
        });

        // order data
        const orderResult = await orderCollection.insertOne({
          buyerInfo: { userId: buyerId, name: buyerName, email: buyerEmail },
          sellerInfo: { userId: sellerId, name: sellerName, email: sellerEmail },
          productId,
          productTitle: title,
          productImage: image,
          price: Number(price),
          paymentStatus: 'paid',
          orderStatus: 'Pending',
          createdAt: new Date(),
        });

        res.status(201).send({ paymentResult, orderResult });
      } catch (error) {
        console.error('Payment route error:', error); // ekhon terminal-e real error dekhaবে
        res.status(500).send({ message: 'Failed to process payment', error: error.message });
      }
    });

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
  res.send('server is running')
})

app.listen(port, () => {
  console.log(`server is running on port ${port}`)
})