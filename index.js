const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require('mongodb');

// middlewares
app.use(cors());
app.use(express.json());

const uri = `${process.env.MONGO_URI}`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// collections
const admissionCollection = client.db("customAppDB").collection("admission");
const locationCollection = client.db("customAppDB").collection("locations");

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to Custom CMS API");
});

// ------------all admission routes-----------
app.post("/admission", async (req, res) => {
  try {
    const newStudentInfo = req.body;
    const result = await admissionCollection.insertOne(newStudentInfo);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/admission", async (req, res) => {
  try {
    const admissions = await admissionCollection.find().toArray();
    res.send(admissions);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// -----Location Routes---------
app.post("/locations", async (req, res) => {
  try {
    const locationInfo = req.body;
    const newLocation = await locationCollection.insertOne(locationInfo);
    res.send(newLocation);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/locations", async (req, res) => {
  try {
    const locations = await locationCollection.find().toArray();
    res.send(locations);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Connect to MongoDB and start server
async function run() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB!");
    
    if (process.env.NODE_ENV !== 'production') {
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    }
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

run().catch(console.dir);

// Export the Express API for Vercel
module.exports = app;

