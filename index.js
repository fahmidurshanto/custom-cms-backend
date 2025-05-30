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
const storage = multer.memoryStorage(); // Use memoryStorage for file uploads
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
const employeesCollection = client.db("customAppDB").collection("employees");
const emailsCollection = client.db("customAppDB").collection("emails");

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
      createdAt: new Date(),
    };

    if (req.file) {
      newVendor.logo = {
        data: req.file.buffer.toString('base64'),
        contentType: req.file.mimetype
      };
    }

    const result = await vendorCollection.insertOne(newVendor);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/vendors", async (req, res) => {
  try {
    const vendors = await vendorCollection.find().sort({ createdAt: -1 }).toArray();
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
    if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid Vendor ID format" });
    }
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
        invoicePrefix: req.body.invoicePrefix,
        updatedAt: new Date()
      }
    };

    if (req.file) {
      updateDoc.$set.logo = {
        data: req.file.buffer.toString('base64'),
        contentType: req.file.mimetype
      };
    } else if (req.body.logo === 'null') { // Check if client wants to remove logo
        updateDoc.$unset = { logo: "" }; // Or updateDoc.$set.logo = null;
    }


    const result = await vendorCollection.updateOne(filter, updateDoc);
    if (result.matchedCount === 0) {
        return res.status(404).send({ message: "Vendor not found" });
    }
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete("/vendors/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid Vendor ID format" });
    }
    const filter = { _id: new ObjectId(id) };
    const result = await vendorCollection.deleteOne(filter);
    if (result.deletedCount === 0) {
        return res.status(404).send({ message: "Vendor not found" });
    }
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


// ------------ Employee Routes ------------
// Middleware for handling 'photo' and 'signature' file uploads
const employeeUploads = upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
]);

app.post("/employees", employeeUploads, async (req, res) => {
  try {
    const employeeData = req.body;
    const newEmployee = {
        fullName: employeeData.fullName,
        surname: employeeData.surname, // Assuming surname is sent; add if not
        email: employeeData.email,
        mNumber: employeeData.mNumber, // Mobile Number
        contact: employeeData.contact, // Contact Number
        address1: employeeData.address1,
        address2: employeeData.address2,
        position: employeeData.position,
        status: employeeData.status,
        dob: employeeData.dob ? new Date(employeeData.dob) : null, // Date of Birth
        licenseNo: employeeData.licenseNo,
        joiningDate: employeeData.joiningDate ? new Date(employeeData.joiningDate) : null,
        leavingDate: employeeData.leavingDate ? new Date(employeeData.leavingDate) : null,
        gender: employeeData.gender,
        vendor: employeeData.vendor, // This should be the vendor's _id
        note: employeeData.note,
        createdAt: new Date(),
    };

    if (req.files && req.files.photo && req.files.photo[0]) {
      newEmployee.photo = {
        data: req.files.photo[0].buffer.toString('base64'),
        contentType: req.files.photo[0].mimetype
      };
    }
    if (req.files && req.files.signature && req.files.signature[0]) {
      newEmployee.signature = {
        data: req.files.signature[0].buffer.toString('base64'),
        contentType: req.files.signature[0].mimetype
      };
    }

    const result = await employeesCollection.insertOne(newEmployee);
    // Return the inserted document with its _id
    const insertedEmployee = await employeesCollection.findOne({_id: result.insertedId});
     const formattedEmployee = {
        ...insertedEmployee,
        id: insertedEmployee._id, // React component might expect 'id'
        photo: insertedEmployee.photo ? `data:${insertedEmployee.photo.contentType};base64,${insertedEmployee.photo.data}` : null,
        signature: insertedEmployee.signature ? `data:${insertedEmployee.signature.contentType};base64,${insertedEmployee.signature.data}` : null,
    };
    delete formattedEmployee._id; // Remove _id if 'id' is preferred by frontend

    res.status(201).send(formattedEmployee);
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).send({ error: error.message });
  }
});

app.get("/employees", async (req, res) => {
  try {
    const employees = await employeesCollection.find().sort({ createdAt: -1 }).toArray();
    const employeesWithFormattedData = employees.map(emp => ({
      ...emp,
      id: emp._id, // Add 'id' field for frontend compatibility
      photo: emp.photo ? `data:${emp.photo.contentType};base64,${emp.photo.data}` : null,
      signature: emp.signature ? `data:${emp.signature.contentType};base64,${emp.signature.data}` : null,
    }));
    res.send(employeesWithFormattedData);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).send({ error: error.message });
  }
});

app.put("/employees/:id", employeeUploads, async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid Employee ID format" });
    }
    const filter = { _id: new ObjectId(id) };
    const employeeData = req.body;

    const updateDoc = {
      $set: {
        fullName: employeeData.fullName,
        surname: employeeData.surname,
        email: employeeData.email,
        mNumber: employeeData.mNumber,
        contact: employeeData.contact,
        address1: employeeData.address1,
        address2: employeeData.address2,
        position: employeeData.position,
        status: employeeData.status,
        dob: employeeData.dob ? new Date(employeeData.dob) : null,
        licenseNo: employeeData.licenseNo,
        joiningDate: employeeData.joiningDate ? new Date(employeeData.joiningDate) : null,
        leavingDate: employeeData.leavingDate ? new Date(employeeData.leavingDate) : null,
        gender: employeeData.gender,
        vendor: employeeData.vendor,
        note: employeeData.note,
        updatedAt: new Date()
      }
    };

    if (req.files && req.files.photo && req.files.photo[0]) {
      updateDoc.$set.photo = {
        data: req.files.photo[0].buffer.toString('base64'),
        contentType: req.files.photo[0].mimetype
      };
    } else if (employeeData.photo === 'null') { // Client explicitly wants to remove photo
        updateDoc.$unset = { ...updateDoc.$unset, photo: "" };
    }


    if (req.files && req.files.signature && req.files.signature[0]) {
      updateDoc.$set.signature = {
        data: req.files.signature[0].buffer.toString('base64'),
        contentType: req.files.signature[0].mimetype
      };
    } else if (employeeData.signature === 'null') { // Client explicitly wants to remove signature
        updateDoc.$unset = { ...updateDoc.$unset, signature: "" };
    }


    const result = await employeesCollection.updateOne(filter, updateDoc);
    if (result.matchedCount === 0) {
        return res.status(404).send({ message: "Employee not found" });
    }
     // Fetch and return the updated document
    const updatedEmployee = await employeesCollection.findOne(filter);
    const formattedEmployee = {
        ...updatedEmployee,
        id: updatedEmployee._id,
        photo: updatedEmployee.photo ? `data:${updatedEmployee.photo.contentType};base64,${updatedEmployee.photo.data}` : null,
        signature: updatedEmployee.signature ? `data:${updatedEmployee.signature.contentType};base64,${updatedEmployee.signature.data}` : null,
    };
    delete formattedEmployee._id;
    res.send(formattedEmployee);
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).send({ error: error.message });
  }
});

app.delete("/employees/:id", async (req, res) => {
  try {
    const id = req.params.id;
     if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid Employee ID format" });
    }
    const filter = { _id: new ObjectId(id) };
    const result = await employeesCollection.deleteOne(filter);
     if (result.deletedCount === 0) {
        return res.status(404).send({ message: "Employee not found" });
    }
    res.send({ message: "Employee deleted successfully", deletedCount: result.deletedCount, _id: id });
  } catch (error) {
    console.error("Error deleting employee:", error);
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
      course: req.body.course, // Should be courseId
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      published: req.body.published,
      createdAt: new Date(),
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
      semiDate: req.body.semiDate, // Assuming this is a string or needs parsing
      name: req.body.name,
      doorNumber: req.body.doorNumber,
      courseName: req.body.courseName,
      createdAt: new Date(),
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
        semiDate: req.body.semiDate,
        name: req.body.name,
        doorNumber: req.body.doorNumber,
        courseName: req.body.courseName,
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



// ------------ E-Marketing Routes ------------
app.post("/e-marketing", upload.single('attachment'), async (req, res) => {
  try {
    const { sendOption, sendTime, ...emailData } = req.body;
    const newEmail = {
      to: emailData.to,
      fromMail: emailData.fromMail,
      subject: emailData.subject,
      body: emailData.body,
      proverb: emailData.proverb,
      status: "Pending", // Default status
      sendTime: sendOption === 'now' ? new Date() : new Date(sendTime),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (req.file) {
      newEmail.attachment = {
        data: req.file.buffer.toString('base64'),
        contentType: req.file.mimetype,
        size: req.file.size
      };
    }

    const result = await emailsCollection.insertOne(newEmail);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/e-marketing", async (req, res) => {
  try {
    const emails = await emailsCollection.find().sort({ createdAt: -1 }).toArray();
    const formattedEmails = emails.map(email => ({
      ...email,
      id: email._id,
      attachment: email.attachment ? {
        ...email.attachment,
        url: `data:${email.attachment.contentType};base64,${email.attachment.data}`
      } : null
    }));
    res.send(formattedEmails);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.put("/e-marketing/:id", upload.single('attachment'), async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid Email ID format" });
    }
    
    const filter = { _id: new ObjectId(id) };
    const { sendOption, sendTime, ...updateData } = req.body;
    
    const updateDoc = {
      $set: {
        ...updateData,
        sendTime: sendOption === 'now' ? new Date() : new Date(sendTime),
        updatedAt: new Date()
      }
    };

    if (req.file) {
      updateDoc.$set.attachment = {
        data: req.file.buffer.toString('base64'),
        contentType: req.file.mimetype,
        size: req.file.size
      };
    } else if (req.body.removeAttachment === 'true') {
      updateDoc.$unset = { attachment: "" };
    }

    const result = await emailsCollection.updateOne(filter, updateDoc);
    
    if (result.matchedCount === 0) {
      return res.status(404).send({ message: "Email not found" });
    }
    
    const updatedEmail = await emailsCollection.findOne(filter);
    const formattedEmail = {
      ...updatedEmail,
      id: updatedEmail._id,
      attachment: updatedEmail.attachment ? {
        ...updatedEmail.attachment,
        url: `data:${updatedEmail.attachment.contentType};base64,${updatedEmail.attachment.data}`
      } : null
    };
    
    res.send(formattedEmail);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.delete("/e-marketing/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid Email ID format" });
    }
    
    const filter = { _id: new ObjectId(id) };
    const result = await emailsCollection.deleteOne(filter);
    
    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Email not found" });
    }
    
    res.send({ 
      message: "Email deleted successfully",
      deletedCount: result.deletedCount,
      id: id
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Connect to MongoDB and start server
async function run() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB!");
    
    // Start listening only after successful DB connection
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

  } catch (error) {
    console.error("Failed to connect to MongoDB or start server:", error);
    process.exit(1); // Exit if DB connection fails
  }
}

// Only run the server if not in a test environment or if this file is run directly
if (process.env.NODE_ENV !== 'test') { // Added a check for test environment
    run().catch(console.dir);
}


// Export the Express API for Vercel
module.exports = app;
