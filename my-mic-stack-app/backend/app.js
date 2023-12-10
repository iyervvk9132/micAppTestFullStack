const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const fs = require("fs").promises;
const { readFileSync } = require("fs");

const app = express();
const port = 3000;

// Use bodyParser middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Use express-session middleware for managing sessions
app.use(
  session({
    secret: "your-secret-key",
    resave: true,
    saveUninitialized: true,
  })
);
const data = JSON.parse(readFileSync("./models/CLOTHLIST.json"));
const dataList = JSON.parse(readFileSync("./models/PRICE_FINAL_DATA.json"));
// Connect to MongoDB (change the connection string accordingly)
mongoose.connect("mongodb://localhost:27017/micTestApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a simple mongoose schema and model
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  order: [
    {
      orderList: [
        {
          items: String,
          service: String,
          quantity: Number,
        },
      ],

      pickupDateTime: Date,
      deliveryDateTime: Date,
      orderId:mongoose.Schema.Types.ObjectId,
    },
  ],
});

const User = mongoose.model("customers", userSchema);

// Create a simple mongoose schema and model for orders
const orderSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    orders: [
        {
            items: String,
            service: String,
            quantity: Number,
        }
    ],
    pickupDateTime: Date,
    deliveryDateTime: Date,
});

const Order = mongoose.model('Order', orderSchema);



var username, password;
// Set EJS as the view engine
app.set("view engine", "ejs");

// Middleware to serve static files (CSS, images, etc.)
app.use(express.static("views"));

// Declare an array to store orders
let orderList = [];

// Routes
app.get("/", (req, res) => {
  res.render("home");
});

// Login route
app.get("/login", (req, res) => {
  res.render("login");
});

// Login route
app.post("/login", async (req, res) => {
  username = req.body.username;
  password = req.body.password;

  try {
    // Check if the user with the given username exists
    const user = await User.findOne({ username });

    if (user) {
      // Now, you need to compare the provided password with the hashed password in the database
      // Note: You should use a password hashing library like bcrypt for security
      // For demonstration purposes, assuming plain text passwords (not secure for production)
      if (user.password === password) {
        // Passwords match, so the login is successful
        console.log("Login successful");
        res.redirect(`/${username}/user-data`);
      } else {
        // Passwords don't match
        console.log("Invalid password");
        res.redirect("/login"); // or res.render('login', { error: 'Invalid credentials' });
      }
    } else {
      // User not found
      console.log("User not found");
      res.redirect("/login"); // or res.render('login', { error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Logout route
app.get("/logout", (req, res) => {
  // Destroy the session to log out the user
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// New Order route
app.get("/:username/new-order", (req, res) => {
  // Check if the user is authenticated
  console.log(req.params);
  console.log(req.session);

  res.redirect(`/${req.params.username}/orderList`);
});

app.get("/:username/orderList", (req, res) => {
  console.log(req.params);
  res.render("orderList", {
    data: data,
    subtotal: 0,
    username: req.params.username,
  });
});

app.post("/:username/orderList", async (req, res) => {
  const nonZeroValues = {};
  let total = 0;
  let outputString = "";

  for (const key in req.body) {
    if (req.body.hasOwnProperty(key)) {
      const value = req.body[key];

      // Check if the value is not equal to 0
      if (value !== "0") {
        nonZeroValues[key] = value;
        console.log(key);
      }
    }
  }
  // Capture pickup date/time and delivery date/time from request
  const pickupDateTime = req.body.pickupDateTime;
  const deliveryDateTime = req.body.deliveryDateTime;

  // Now nonZeroValues contains only the properties with values not equal to 0

  console.log("nonZeroValues");
  for (const key in nonZeroValues) {
    console.log(`the item no ${key} has ${nonZeroValues[key]} quantity`);
    const foundItem = dataList.CLOTHES.find(
      (list) => list.ID === parseInt(key)
    );

    console.log(`Item with ID ${key} found:`, foundItem);
    if (foundItem) {
      total = total + foundItem.PRICE * nonZeroValues[key];
      try {
        // Create an order object and push it to the array
        orderList.push({
          items: foundItem.NAME,
          service: foundItem.OPERATION,
          quantity: nonZeroValues[key],
        });
        console.log("New order added to the list");
        console.log(foundItem.NAME);
      } catch (error) {
        console.error("Error adding order to the list:", error);
        return res.status(500).send("Internal Server Error");
      }
      if (outputString === "") {
        outputString =
          JSON.stringify(foundItem) +
          " with the quantity of " +
          nonZeroValues[key];
      } else {
        outputString =
          outputString +
          "," +
          JSON.stringify(foundItem) +
          " with the quantity of " +
          nonZeroValues[key];
      }
    }
  }
  

  // Save the array of orders to MongoDB
  try {
    // Save the array of orders to MongoDB
    const user = await User.findOne({ username: req.params.username });

    if (user) {
      // Update the user's order field with the array of orders
      const result1 = await Order.create({
        userId: req.session.userId,
        orders: orderList,
        pickupDateTime,
        deliveryDateTime,
    });

      const result = await User.updateOne(
        { username: req.params.username },
        { $push: { order: { orderId: result1._id } } },
        { upsert: true }
      );

    //   console.log(result);
      console.log(result1._id);

      // Check if the update was successful
      if (result.acknowledged && result.modifiedCount === 1) {
        // If there was an upsert (document created), use upsertedId; otherwise, use _id
        const modifiedOrderId = result.upsertedId
          ? result.upsertedId._id
          : user._id;
        console.log(
          `Order updated successfully. Modified document ID: ${modifiedOrderId}`
        );

        // Now you can send this ID as a response or use it as needed
        return res.send(
          `Order updated successfully. Modified document ID: ${modifiedOrderId}`
        );
      } else {
        console.error("Failed to update order");
        return res.status(500).send("Failed to update order");
      }
    } else {
      console.error("User not found");
      return res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error saving orders to MongoDB:", error);
    return res.status(500).send("Internal Server Error");
  }
});

// Handle order submission
app.post("/place-order", async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.userId) {
    res.redirect("/login");
    return;
  }

  const { productName, quantity } = req.body;

  try {
    // Create a new order associated with the logged-in user
    await Order.create({
      productName,
      quantity,
      userId: req.session.userId,
    });

    res.redirect("/new-order");
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

// Example route to handle registration (you need to handle form submissions securely)
app.post("/register", async (req, res) => {
  // Assuming you have a form with username and password fields
  console.log(req.body);

  username = req.body.username;
  password = req.body.password;

  try {
    const newUser = await User.create({ username, password });
    console.log("New user registered:", newUser);
    res.redirect("/login");
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send("Internal Server Error");
  }
});
// User data page
app.get("/user-data", (req, res) => {
  // This is a hypothetical user data page, you can render it or send JSON data, etc.
  res.send("User data page");
});

// User data page with dynamic username parameter
app.get("/:username/user-data", (req, res) => {
  const { username } = req.params;

  // Assume you have a function to retrieve user data based on the username
  const userData = getUserData(username);

  if (userData) {
    // Render a dynamic user page with the user data
    res.render("user-data", { userData });
  } else {
    // Handle the case where the user is not found
    res.status(404).send("User not found");
  }
});

// Example function to retrieve user data (replace this with your actual logic)
function getUserData(username) {
  // Perform a query or use any method to retrieve user data from your database
  // For demonstration purposes, returning mock user data
  return {
    username,
    email: "user@example.com",
    // Add more user-related data
  };
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
