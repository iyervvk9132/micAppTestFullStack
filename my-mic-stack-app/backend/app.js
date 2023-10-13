const express = require('express');
const db = require('./config/db'); // Import the MongoDB connection
const bodyParser = require('body-parser');
const Customer = require('./models/customer-model')

const app = express();



app.use(bodyParser.json());
// Define a route to set customer data
app.post('/api/customers',  (req, res) => {
    const { name, email, phone } = req.body;
    console.log(req.body);
    res.json(req.body);
    // try {
    //   const { name, email, phone } = req.body;
      
    //   // Create a new customer document
    //   const customer = new Customer({
    //     name,
    //     email,
    //     phone,
    //   });
  
    //   // Save the customer data to the database
    //   await customer.save();
  
    //   res.json({ message: 'Customer data saved successfully' });
    // } catch (error) {
    //   console.error('Error:', error);
    //   res.status(500).json({ error: 'An error occurred while saving customer data' });
    // }
  });


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
  