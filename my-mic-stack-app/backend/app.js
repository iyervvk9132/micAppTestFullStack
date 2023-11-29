
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs').promises;
const { readFileSync } = require('fs');

const data = JSON.parse(readFileSync('./models/PRICE_FINAL_DATA.json'));
const datalist=JSON.parse(readFileSync('./models/CLOTHLIST.json'));
// const dataStr=JSON.parse(data);
const app = express();
const port = 3000;
var subTotal=0;
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/micTestApp', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;


db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});


// Define User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const User = mongoose.model('customerData', userSchema);


app.use(bodyParser.urlencoded({ extended: true }));

// set the view engine to ejs
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('views'));
// Serve static files from the 'public' directory

app.get('/',(req,res)=>{
  console.log('home');
  res.render('home.ejs')
  
});
app.get('/priceList',(req,res)=>{
  console.log('priceList');
  // console.log(JSON.parse(data));
   res.render('priceList.ejs',{data:data.CLOTHES})
  // res.json(data);
  console.log(data);
});
app.get('/login',(req,res)=>{
  console.log('login');
  res.send('this is login page')
});
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
  try {
      // Create a new user using the User model
      const newUser = new User({
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
      });

      // Save the user to the database
      const savedUser = await newUser.save();
      console.log('User registered:', savedUser);
      res.send('Registration successful!');
  } catch (error) {
      console.error('Error during registration:', error.message);
      res.status(500).send('Internal Server Error');
  }
});
app.get('/clothes/new', (req, res) => {
  res.render('clothesRegister');
});

app.get('/orderList', (req, res) => {
  res.render('orderList',{data:datalist,subtotal:subTotal});
  console.log(req.body);

});
app.post('/orderList', (req, res) => {
  const quantities = {};
  // const subtotal = req.body.data((total, product) => {
  //     const quantity = parseInt(req.body[`${product.ID}`], 10);
  //     quantities[product.ID] = quantity;
  //     return total + quantity * product.PRICE;
  // }, 0);

  // quantities object now contains the selected quantities for each product
  // subtotal variable contains the overall subtotal
  // ... (other processing)

  res.render('orderList', { data: datalist, subtotal: subTotal });
  console.log(req.body);

});


app.get('*', function(req, res){
  console.log('404 error');
  res.status(404).send('404 error');
});
app.listen(port, () => {  
  console.log(`Server is running at http://localhost:${port}`);
});
