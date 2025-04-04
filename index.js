const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require('mongodb');

// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB__USER}:${process.env.DB__PASSWORD}@fahmidurdb.ax63z.mongodb.net/?retryWrites=true&w=majority&appName=FahmidurDB`;







// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// collections
const admissionCollection = client.db("fahmidurDB").collection("admission");
const locationCollection = client.db("fahmidurDB").collection("locations");
async function run() {
  try {
    await client.connect();
    // Send a ping to confirm a successful connection
    app.get("/", (req, res) =>{
        res.send("Welcome to Custom CMS API");
    })


    // ------------all admission routes-----------
    app.post("/admission", async (req, res) =>{
        const newStudentInfo = req.body;
        const result = await admissionCollection.insertOne(newStudentInfo);
        res.send(result)
    })

    app.get("/admission", async(req, res) =>{
        const admissions = await admissionCollection.find().toArray();
        res.send(admissions)
    })

    // -------------------------------------------
    
    // -----Location ROutes---------
    app.post("/locations", async (req, res)=>{
      const locationInfo  = req.body;
      const newLocation = await locationCollection.insertOne(locationInfo);
      res.send(newLocation)
    })

    app.get("/locations", async (req, res) =>{
      console.log(locationCollection)
      const locations = await locationCollection.find().toArray();
      res.send(locations)
    })
    

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
