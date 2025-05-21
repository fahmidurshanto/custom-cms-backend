const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
require("dotenv").config();
const multer = require('multer');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');




// middlewares
app.use(cors());
app.use(express.json());
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
const studentsCollection = client.db("customAppDB").collection("students");
const locationCollection = client.db("customAppDB").collection("locations");
const vendorCollection = client.db("customAppDB").collection("vendors");
const coursesCollection = client.db("customAppDB").collection("courses");
const batchesCollection = client.db("customAppDB").collection("batches");
const certificationsCollection = client.db("customAppDB").collection("certifications");



// Root route
app.get("/", (req, res) => {
  res.send("Welcome to Custom CMS API");
});

// ------------all admission routes-----------
app.post("/students", async (req, res) => {
  try {
    const newStudentInfo = req.body;
    const result = await studentsCollection.insertOne(newStudentInfo);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/students", async (req, res) => {
  try {
    const students = await studentsCollection.find().toArray();
    res.send(students);
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
// -----Location Routes---------
// Add these routes below your existing location routes

app.put("/locations/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updatedLocation = req.body;
    
    const updateDoc = {
      $set: {
        location: updatedLocation.location,
        address1: updatedLocation.address1,
        address2: updatedLocation.address2,
        published: updatedLocation.published
      }
    };

    const result = await locationCollection.updateOne(filter, updateDoc, options);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete("/locations/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const result = await locationCollection.deleteOne(filter);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});



// ------------ Vendor Routes ------------
app.post("/vendors", upload.single('logo'), async (req, res) => {
  try {
    const approvedBy = req.body.approvedBy ? 
      (Array.isArray(req.body.approvedBy) ? req.body.approvedBy : [req.body.approvedBy]) 
      : [];

    const newVendor = {
      name: req.body.name,
      fax: req.body.fax,
      published: req.body.published,
      approvedBy: approvedBy,
      accountInfo: req.body.accountInfo,
      webAddress: req.body.webAddress,
      address1: req.body.address1,
      address2: req.body.address2,
      regInfo: req.body.regInfo,
      phone: req.body.phone,
      email: req.body.email,
      invoicePrefix: req.body.invoicePrefix,
    };

    if (req.file) {
      newVendor.logo = {
        data: req.file.buffer.toString('base64'),
        contentType: req.file.mimetype
      };
    }

    const result = await vendorCollection.insertOne(newVendor);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/vendors", async (req, res) => {
  try {
    const vendors = await vendorCollection.find().toArray();
    const vendorsWithLogo = vendors.map(vendor => ({
      ...vendor,
      logo: vendor.logo ? `data:${vendor.logo.contentType};base64,${vendor.logo.data}` : null
    }));
    res.send(vendorsWithLogo);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.put("/vendors/:id", upload.single('logo'), async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    
    const approvedBy = req.body.approvedBy ? 
      (Array.isArray(req.body.approvedBy) ? req.body.approvedBy : [req.body.approvedBy]) 
      : [];

    const updateDoc = {
      $set: {
        name: req.body.name,
        fax: req.body.fax,
        published: req.body.published,
        approvedBy: approvedBy,
        accountInfo: req.body.accountInfo,
        webAddress: req.body.webAddress,
        address1: req.body.address1,
        address2: req.body.address2,
        regInfo: req.body.regInfo,
        phone: req.body.phone,
        email: req.body.email,
        invoicePrefix: req.body.invoicePrefix
      }
    };

    if (req.file) {
      updateDoc.$set.logo = {
        data: req.file.buffer.toString('base64'),
        contentType: req.file.mimetype
      };
    }

    const result = await vendorCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete("/vendors/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const result = await vendorCollection.deleteOne(filter);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// ------------ Course Routes ------------
app.post("/courses", async (req, res) => {
  try {
    const courseData = {
      title: req.body.title,
      code: req.body.code,
      published: req.body.published,
      assignmentDuration: parseInt(req.body.assignmentDuration),
      createdAt: new Date()
    };
    
    const result = await coursesCollection.insertOne(courseData);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/courses", async (req, res) => {
  try {
    const courses = await coursesCollection.find().sort({ createdAt: -1 }).toArray();
    res.send(courses);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.put("/courses/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    
    const updateDoc = {
      $set: {
        title: req.body.title,
        code: req.body.code,
        published: req.body.published,
        assignmentDuration: parseInt(req.body.assignmentDuration),
        updatedAt: new Date()
      }
    };

    const result = await coursesCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete("/courses/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const result = await coursesCollection.deleteOne(filter);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// ------------ Batch Routes ------------
app.post("/batches", async (req, res) => {
  try {
    const batchData = {
      batchNo: req.body.batchNo,
      course: req.body.course,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      published: req.body.published,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await batchesCollection.insertOne(batchData);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/batches", async (req, res) => {
  try {
    const batches = await batchesCollection.find().sort({ createdAt: -1 }).toArray();
    res.send(batches);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.put("/batches/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    
    const updateDoc = {
      $set: {
        batchNo: req.body.batchNo,
        course: req.body.course,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        published: req.body.published,
        updatedAt: new Date()
      }
    };

    const result = await batchesCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete("/batches/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const result = await batchesCollection.deleteOne(filter);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// ------------ Certification Routes ------------
app.post("/certifications", async (req, res) => {
  try {
    const certificationData = {
      certificateId: req.body.certificateId,
      recipient: req.body.recipient,
      course: req.body.course,
      issueDate: new Date(req.body.issueDate),
      status: req.body.status,
      createdAt: new Date()
    };
    
    const result = await certificationsCollection.insertOne(certificationData);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/certifications", async (req, res) => {
  try {
    const certifications = await certificationsCollection.find().sort({ createdAt: -1 }).toArray();
    res.send(certifications);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.put("/certifications/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    
    const updateDoc = {
      $set: {
        certificateId: req.body.certificateId,
        recipient: req.body.recipient,
        course: req.body.course,
        issueDate: new Date(req.body.issueDate),
        status: req.body.status,
        updatedAt: new Date()
      }
    };

    const result = await certificationsCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete("/certifications/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const result = await certificationsCollection.deleteOne(filter);
    res.send(result);
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

