// Importing required modules and libraries
const express = require("express"); // Express.js for building the web application
const mongoose = require("mongoose"); // Mongoose for MongoDB integration
const bodyParser = require("body-parser"); // Body-parser for parsing incoming request bodies
const session = require("express-session"); // Express-session for managing user sessions
const fs = require("fs").promises; // Promisified file system module for reading files
const { readFileSync } = require("fs"); // Synchronous file read function
const Nexmo = require("nexmo"); // Nexmo for SMS communication
const DateTimeSlots = require("date-time-slots").default; // Library for managing date and time slots
const axios = require("axios"); // Axios for making HTTP requests
const { ObjectId } = require("mongodb"); // MongoDB ObjectId for unique identifiers
const Razorpay = require("razorpay"); // Razorpay for payment processing
const uuid = require("uuid");
const cors = require("cors");
const jwt = require("jsonwebtoken");
/**
 * @constant razorpay
 * @description Configuring Razorpay with API keys.
 * @property {string} key_id - Razorpay API key ID.
 * @property {string} key_secret - Razorpay API secret key.
 */
const razorpay = new Razorpay({
  key_id: "rzp_test_hz7exB8EYQbPhc",
  key_secret: "i2LIhe1AicXd8VidEuFapAYU",
});

/**
 * @constant app
 * @description Creating an instance of Express.
 */
const app = express();

/**
 * @constant port
 * @description Port number for the Express server.
 * @default 3000
 */
const port = 3000;

const secretKey = "iyer_vivek";
/**
 * @middleware
 * @description Configuring middleware to parse JSON request bodies.
 */
app.use(bodyParser.json());

/**
 * @middleware
 * @description Configuring middleware to parse URL-encoded request bodies.
 */
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * @middleware
 * @description Configuring Express-session for managing user sessions.
 */
app.use(
  session({
    secret: "your-secret-key",
    resave: true,
    saveUninitialized: true,
  })
);

/**

@middleware
@description Configures CORS (Cross-Origin Resource Sharing) to allow cross-origin requests.
*/
app.use(cors());

/**
 * @constant data
 * @description Reading JSON file for initial data (assuming CLOTHLIST.json exists in the models directory).
 * @type {object}
 */
const data = JSON.parse(readFileSync("./models/CLOTHLIST.json"));

/**
 * @constant dataList
 * @description Reading JSON file for initial data (assuming PRICE_FINAL_DATA.json exists in the models directory).
 * @type {object}
 */
const dataList = JSON.parse(readFileSync("./models/PRICE_FINAL_DATA.json"));

/**
 * @constant pricelistdata
 * @description Reading JSON file for initial data (assuming data.json exists in the views directory).
 * @type {object}
 */
const pricelistdata = JSON.parse(readFileSync("./views/data.json"));

/**
 * @constant orderList
 * @description An array to store order information.
 * @type {Array}
 */
let orderList = [];

/**
 * @constant pickupDate
 * @description Variable to store pickup date.
 * @type {Date}
 */
let pickupDate;

/**
 * @constant pickupTime
 * @description Variable to store pickup time.
 * @type {string}
 */
let pickupTime;

/**
 * @constant deliveryDate
 * @description Variable to store delivery date.
 * @type {Date}
 */
let deliveryDate;

/**
 * @constant deliveryTime
 * @description Variable to store delivery time.
 * @type {string}
 */
let deliveryTime;

/**
 * @constant result1
 * @description Placeholder variable (assuming it will be used for some purpose in the code).
 * @type {any}
 */
let result1;

/**
 * @event mongoose
 * @description Connecting to MongoDB using Mongoose.
 */
mongoose.connect("mongodb://localhost:27017/micTestApp");

/**
 * @schema User
 * @description Mongoose schema for the User model.
 * @property {string} phone - User's phone number.
 * @property {boolean} isVerified - User verification status, default is false.
 * @property {string} verificationCode - Verification code sent to the user.
 * @property {Array} order - Array of orders associated with the user.
 * @property {number} totalUnpaid - Total unpaid amount by the user.
 * @property {number} totalPaid - Total amount paid by the user.
 * @property {ObjectId} payzappId - ObjectId reference to Payzapp (assuming Payzapp is another model).
 * @property {Object} address - User's address information.
 * @property {number} address.latitude - Latitude of the address.
 * @property {number} address.longitude - Longitude of the address.
 * @property {string} address.road - Road of the address.
 * @property {string} address.suburb - Suburb of the address.
 * @property {string} address.city - City of the address.
 * @property {string} address.state - State of the address.
 * @property {string} address.country - Country of the address.
 * @property {string} address.countryCode - Country code of the address.
 * @property {boolean} address.isFilled - Flag indicating if the address is filled, default is false.
 */
const userSchema = new mongoose.Schema({
  phone: String,
  isVerified: { type: Boolean, default: false },
  verificationCode: String,
  order: [
    {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    },
  ],
  totalUnpaid: Number,
  totalPaid: Number,
  payzappId: { type: ObjectId },
  address: {
    latitude: Number,
    longitude: Number,
    streetName: String,
    areaName: String,
    cityName: String,
    stateName: String,
    countryName: String,
    zipCode: String,
    userApartmentName: String,
    userStreetName: String,
    userLandmark: String,
    isFilled: { type: Boolean, default: false },
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

/**
 * @model User
 * @description Mongoose model for the User schema.
 */
const User = mongoose.model("customers", userSchema);

/**
 * @schema Driver
 * @description Mongoose schema for the Driver model.
 * @property {string} phone - Driver's phone number.
 * @property {boolean} isVerified - Driver verification status, default is false.
 * @property {string} verificationCode - Verification code sent to the driver.
 * @property {Array} pickupOrder - Array of pickup orders associated with the driver.
 * @property {Array} deliveryOrder - Array of delivery orders associated with the driver.
 * @property {Object} address - Driver's address information.
 * @property {number} address.latitude - Latitude of the address.
 * @property {number} address.longitude - Longitude of the address.
 * @property {string} address.road - Road of the address.
 * @property {string} address.suburb - Suburb of the address.
 * @property {string} address.city - City of the address.
 * @property {string} address.state - State of the address.
 * @property {string} address.country - Country of the address.
 * @property {string} address.countryCode - Country code of the address.
 * @property {Array} salary - Array containing daily cost, monthly wages, and loan details.
 */
const driverSchema = new mongoose.Schema({
  phone: String,
  isVerified: { type: Boolean, default: false },
  verificationCode: String,
  pickupOrder: [
    {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
      date: Date,
    },
  ],
  deliveryOrder: [
    {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
      date: Date,
    },
  ],
  address: {
    latitude: Number,
    longitude: Number,
    road: String,
    suburb: String,
    city: String,
    state: String,
    country: String,
    countryCode: String,
  },
  salary: [
    {
      dailyCost: [{ date: Date, money: Number }],
      monthlyWages: [{ date: Date, money: Number }],
      loan: [{ date: Date, money: Number }],
    },
  ],
});

/**
 * @model Driver
 * @description Mongoose model for the Driver schema.
 */
const Driver = mongoose.model("driver", driverSchema);

/**
 * @schema Order
 * @description Mongoose schema for the Order model.
 * @property {ObjectId} userId - ObjectId reference to the User model.
 * @property {Array} orders - Array of items in the order.
 * @property {number} totalPrice - Total price of the order.
 * @property {boolean} isPaid - Flag indicating if the order is paid, default is false.
 * @property {Object} payment - Payment details including total paid and total unpaid.
 * @property {Date} pickupDate - Pickup date for the order.
 * @property {Date} deliveryDate - Delivery date for the order.
 * @property {string} pickupTime - Pickup time for the order.
 * @property {string} deliveryTime - Delivery time for the order.
 * @property {boolean} isPickedUp - Flag indicating if the order is picked up, default is false.
 * @property {ObjectId} pickupDriverId - ObjectId reference to the Driver model for pickup.
 * @property {boolean} isDriverConfirmed - Flag indicating if the driver confirmed pickup, default is false.
 * @property {boolean} isWorkStarted - Flag indicating if work on the order has started, default is false.
 * @property {boolean} isWorkCompleted - Flag indicating if work on the order is completed, default is false.
 * @property {boolean} isDeliveryPickuped - Flag indicating if the delivery is picked up, default is false.
 * @property {ObjectId} deliveryDriverId - ObjectId reference to the Driver model for delivery.
 * @property {boolean} isDelivered - Flag indicating if the order is delivered, default is false.
 */
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "customers" },
  orders: [
    {
      itemId: Number,
      items: String,
      service: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalPrice: Number,
  isPaid: { type: Boolean, default: false },
  payment: {
    totalPaid: { type: Number, default: 0 },
    totalUnpaid: { type: Number, default: 0 },
    razorpayOrderId: String, // New subfield for Razorpay order ID
  },
  pickupDate: Date,
  deliveryDate: Date,
  pickupTime: String,
  deliveryTime: String,
  isPickedUp: { type: Boolean, default: false },
  isPickedUpReached:{type: Boolean, default: false},
  pickupDriverId: { type: mongoose.Schema.Types.ObjectId, ref: "driver" },
  isDriverConfirmed: { type: Boolean, default: false },
  isWorkStarted: { type: Boolean, default: false },
  isWorkCompleted: { type: Boolean, default: false },
  isDeliveryPickuped: { type: Boolean, default: false },
  deliveryDriverId: { type: mongoose.Schema.Types.ObjectId, ref: "driver" },
  isDelivered: { type: Boolean, default: false },
});

/**
 * @model Order
 * @description Mongoose model for the Order schema.
 */
const Order = mongoose.model("Order", orderSchema);

/**
 * @constant nexmo
 * @description Nexmo SMS API configuration.
 * @property {string} apiKey - Nexmo API key.
 * @property {string} apiSecret - Nexmo API secret.
 */
const nexmo = new Nexmo({
  apiKey: "9554da47",
  apiSecret: "SR1K1dNZ8rx7dJAK",
});

/**
 * @event app.set
 * @description Setting the view engine for rendering templates to EJS.
 */
app.set("view engine", "ejs");

/**
 * @event app.use
 * @description Serving static files from the 'views' directory.
 */
app.use(express.static("views"));

/**
 * @route GET /
 * @description Renders the home page for user interaction.
 * @returns {Object} The rendered home page.
 */
app.get("/", (req, res) => {
  res.render("home", { type: "user" });
});

const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, secretKey);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate." });
  }
};


/**
 * @route POST /user/login
 * @description Handles user login by sending a verification code via SMS.
 * @param {string} phone - The user's phone number.
 * @returns {Object} The response object or an error message.
 */
app.post("/user/login", async (req, res) => {
  const phone = req.body.phone;
  console.log("user/login");
  console.log(req.body);
  const newphone = phone.substring(1);
  console.log(newphone);

  try {
    const user = await User.findOne({ phone: newphone });
    console.log(user);

    let verificationCode;
    if (user) {
      verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      await User.updateOne({ phone: newphone }, { verificationCode });
    } else {
      verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      await User.create({ phone: newphone, verificationCode });
    }

    nexmo.message.sendSms(
      "YourApp",
      phone,
      `Your verification code is: ${verificationCode}`,
      (err, responseData) => {
        if (err) {
          console.error(err);
          res
            .status(500)
            .json({
              success: false,
              message: "Failed to send verification code",
            });
        } else {
          console.log(responseData);
          res
            .status(200)
            .json({ success: true, message: "verification code success" });
        }
      }
    );
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
/**
 * @route POST /user/:phone/account-details
 * @description Handles the submission of user account details like name, phone number, and address.
 * @param {string} phone - The user's phone number.
 * @param {Object} address - The user's address details.
 * @param {number} address.latitude - The latitude of the address.
 * @param {number} address.longitude - The longitude of the address.
 * @param {string} address.road - The road of the address.
 * @param {string} address.suburb - The suburb of the address.
 * @param {string} address.city - The city of the address.
 * @param {string} address.state - The state of the address.
 * @param {string} address.country - The country of the address.
 * @param {string} address.countryCode - The country code of the address.
 * @returns {Object} The response object or an error message.
 */
app.post("/user/:phone/account-details", verifyToken, async (req, res) => {
  const { name, address } = req.body;
  const { phone } = req.params;

  try {
    // Find the user by phone number
    const user = await User.findOne({ phone });

    if (user) {
      // Update user details
      user.name = name;
      user.address = {
        ...address,
        isFilled: true,
      };
      await user.save();

      res
        .status(200)
        .json({
          success: true,
          message: "Account details updated successfully",
        });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating account details:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/**
 * @route POST /user/:phone/details
 * @description Retrieves customer details based on the provided phone number.
 * @param {string} phone - The user's phone number.
 * @returns {Object} The user details or an error message.
 */
app.post("/user/:phone/details", async (req, res) => {
  const { phone } = req.params;

  try {
    const user = await User.findOne({ phone });

    if (user) {
      res.status(200).json({
        success: true,
        user: {
          phone: user.phone,
          isVerified: user.isVerified,
          totalUnpaid: user.totalUnpaid,
          totalPaid: user.totalPaid,
          address: user.address,
        },
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error retrieving user details:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/**
 * @route GET /user/verify-otp
 * @description Renders the OTP verification page for user authentication.
 * @returns {Object} The rendered OTP verification page.
 */
app.get("/user/verify-otp", (req, res) => {
  res.render("verify-otp", { phone, user: "user" });
});


/**
 * @route POST /user/:phone/verify-otp
 * @description Handles OTP verification and redirects based on user verification status.
 * @param {string} phone - The user's phone number.
 * @param {string} verificationCode - The OTP entered by the user.
 * @returns {Object} The response object or an error message.
 */
app.post("/user/:phone/verify-otp", async (req, res) => {
  const { phone, verificationCode } = req.body;

  try {
    console.log("verify-otp");
    console.log(req.body);

    const user = await User.findOne({ phone, verificationCode });

    if (user) {
      await User.updateOne({ phone }, { isVerified: true });
      console.log(user.address);

      // Generate JWT token
      const token = jwt.sign(
        { _id: user._id.toString(), phone: user.phone },
        secretKey
      );

      // Store the token in the database
      user.tokens = user.tokens.concat({ token });
      await user.save();

        res.json({
          message: "Verification successful",
          token,
          redirectUrl: `/user/${phone}/home`,
        });
      
    } else {
      res.status(401).send("Invalid verification code");
    }
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * @route POST /user/verify-otp
 * @description Handles OTP verification and redirects based on user verification status.
 * @param {string} phone - The user's phone number.
 * @param {string} verificationCode - The OTP entered by the user.
 * @returns {Object} The response object or an error message.
 */

app.post("/user/verify-otp", async (req, res) => {
  const { phone, verificationCode } = req.body;
  console.log(req.body);
  const newPhone = phone.startsWith("+") ? phone.substring(1) : phone;

  try {
    const user = await User.findOne({ phone: phone, verificationCode });
    console.log(user);

    if (user) {
      await User.updateOne({ phone }, { isVerified: true });
      console.log(user.address);
      if (user.address.isFilled === false) {
        // let verify = res.redirect(`/user/${newPhone}/verify-address`);
        res.status(200);
      } else {
        // res.redirect(`/user/${newPhone}/home`);
        res.status(200);
      }
    } else {
      res.status(401).send("Invalid verification code");
    }
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * @route GET /user/:phone/new-order
 * @description Redirects users to the order list page for creating a new order.
 * @param {string} phone - The user's phone number.
 * @returns {Object} The redirected order list page.
 */

app.get("/user/:phone/new-order", (req, res) => {
  console.log(req.params);
  console.log(req.session);

  res.redirect(`/user/${req.params.phone}/orderList`);
});

/**
 * @route GET /user/:phone/orderList
 * @description Renders the order list page with available options for order creation.
 * @param {string} phone - The user's phone number.
 * @returns {Object} The rendered order list page with necessary data.
 */
app.get("/user/:phone/orderList", (req, res) => {
  console.log("orderList get");
  console.log(req.params);
  let today = new Date();
  let test = new Date();
  let time;
  console.log(today.getHours());
  if (today.getHours() >= 16) {
    today.setDate(today.getDate() + 1);
  }
  (day = today.getDate()),
    (month = today.getMonth() + 1), //January is 0
    (year = today.getFullYear());
  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = "0" + month;
  }

  if (test.getDay() == today.getDate()) {
    time = today.getHours() + 1;
  } else {
    time = 10;
  }
  today = year + "-" + month + "-" + day;
  console.log(time);
  time = time + ":00";
  console.log(today);
  res.render("orderList", {
    data: data,
    subtotal: 0,
    phone: req.params.phone,
    currentDate: today,
    startTime: time,
  });
});

/**
 * @route POST /user/:phone/orderList
 * @description Handles the creation of a new order based on user input.
 * @param {string} phone - The user's phone number.
 * @param {Object} req.body - The request body containing user-selected order details.
 * @returns {Object} The response object or an error message.
 */
app.post("/user/:phone/orderList", verifyToken, async (req, res) => {
  let nonZeroValues = {};
  let total = 0;
  let outputString = "";
  let orderList = [];
  console.log(req.body);

  const { phone } = req.params;

  for (const key in req.body) {
    if (req.body.hasOwnProperty(key)) {
      const value = req.body[key];

      if (value !== "0") {
        nonZeroValues[key] = value;
        console.log(key);
      }
    }
  }

  console.log("nonZeroValues");
  for (const key in nonZeroValues) {
    console.log(`the item no ${key} has ${nonZeroValues[key]} quantity`);
    const foundItem = dataList.CLOTHES.find((list) => list.ID === parseInt(key));

    console.log(`Item with ID ${key} found:`, foundItem);
    if (foundItem) {
      total = total + foundItem.PRICE * nonZeroValues[key];
      try {
        orderList.push({
          itemId: key,
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
    if (key === "pickupDate") {
      pickupDate = nonZeroValues[key];
      console.log("pickupDate");
      console.log(nonZeroValues[key]);
    }
    if (key === "pickupTime") {
      pickupTime = nonZeroValues[key];
      console.log("pickupTime");
      console.log(nonZeroValues[key]);
    }
    if (key === "deliveryDate") {
      deliveryDate = nonZeroValues[key];
    }
    if (key === "deliveryTime") {
      deliveryTime = nonZeroValues[key];
      console.log("deliveryTime");
      console.log(nonZeroValues[key]);
    }
  }

  try {
    const user = await User.findOne({ phone: req.params.phone });
    console.log(req.params);

    if (!user) {
      console.error("User not found");
      return res.status(404).send("User not found");
    }

    if (!user.address || !user.address.isFilled) {
      console.error("User address not filled");
      return res.status(400).send("User address is not filled. Please update your address.");
    }

    // Generate Razorpay order with amount 0
    razorpay.orders.create(
      { amount: 100, currency: "INR" },
      async (err, order) => {
        if (err) {
          console.error("Error creating Razorpay order:", err);
          return res.status(500).send("Failed to create Razorpay order");
        } else {
          // Update the order document with Razorpay order ID
          const razorpayOrderId = order.id;

          console.log(Date.parse(pickupDate));
          console.log(pickupTime);
          console.log(Date.parse(deliveryDate));
          console.log(deliveryTime);
          const result1 = await Order.create({
            userId: user._id,
            // orders: orderList,
            pickupDate: Date.parse(pickupDate),
            pickupTime: pickupTime,
            // deliveryDate: Date.parse(deliveryDate),
            // deliveryTime: deliveryTime,
            totalPrice: total,
            payment: {
              totalPaid: 0, // Initialize totalPaid as 0 when creating the order
              totalUnpaid: total, // Initialize totalUnpaid with the total amount
              razorpayOrderId: razorpayOrderId, // Placeholder for the Razorpay order ID
            },
          });

          const result = await User.updateOne(
            { phone: req.params.phone },
            { $push: { order: { orderId: result1._id } } },
            { upsert: true }
          );

          console.log("result1");
          console.log(result1);

          if (result.acknowledged && result.modifiedCount === 1) {
            const modifiedOrderId = result1._id;
            return res.redirect(`/user/${req.params.phone}/order/${result1._id}/payment`);
          } else {
            console.error("Failed to update order");
            return res.status(500).send("Failed to update order");
          }
        }
      }
    );
  } catch (error) {
    console.log(pickupTime);
    console.log(deliveryTime);
    console.error("Error saving orders to MongoDB:", error);
    return res.status(500).send("Internal Server Error");
  }
});

/**
 * @route GET /user/register
 * @description Renders the user registration page.
 * @returns {Object} The rendered registration page for users.
 */
app.get("/user/register", (req, res) => {
  res.render("register", { type: "user" });
});

/**
 * @route POST /user/register
 * @description Handles user registration, checks if the user already exists, and sends a verification code via SMS.
 * @param {string} phone - The phone number provided by the user for registration.
 * @returns {Object} Returns a response based on user registration status:
 *                   - If the user is already registered, returns an error message with status 400 if the request is from a mobile device, otherwise redirects to the login page.
 *                   - If the user is not already registered, creates a new user, sends a verification code via SMS, and redirects to the OTP verification page.
 *                   - If an error occurs during registration, returns an error message with status 500.
 */

app.post("/user/register", async (req, res) => {
  console.log("post for user is entered");
  const phone = req.body.phone;
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  try {
    const newUser = await User.create({ phone, verificationCode });
    const phone = phone.startsWith("+") ? phone : `+${phone}`;

    nexmo.message.sendSms(
      "YourApp",
      phone,
      `Your verification code is: ${verificationCode}`,
      (err, responseData) => {
        if (err) {
          console.error(err);
          res.status(500).send("Failed to send verification code");
        } else {
          console.log(responseData);
          res.redirect(`/user/${newUser.phone}/verify-otp`);
        }
      }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send("An error occurred during registration");
  }
});

/**
 * @route GET /user/:phone/verify-address
 * @description Renders the address verification page for users.
 * @param {string} phone - The user's phone number.
 * @returns {Object} The rendered address verification page.
 */
app.get("/user/:phone/verify-address", (req, res) => {
  res.render("verify-address", { phone: req.params.phone, type: "user" });
});

/**
 * @route POST /user/:phone/verify-address
 * @description Handles user address verification using OpenStreetMap API.
 * @param {string} phone - The user's phone number.
 * @param {Object} req.body - The request body containing latitude and longitude.
 * @returns {Object} Redirects to the user's home page or displays an error message.
 */
app.post("/user/:phone/verify-address", verifyToken, async (req, res) => {
  const { phone } = req.params;
  const { latitude, longitude } = req.body;
  let road, suburb, city, state, country, countryCode;

  try {
    // const result2 = await nominatim.reverse({
    //   lat: parseFloat(latitude),
    //   lon: parseFloat(longitude),
    //   format: "json",
    // });
    // console.log(result2);
    const customParams = "format=json&zoom=18";

    console.log(req.body);

    const apiUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&${customParams}`;

    axios
      .get(apiUrl)
      .then((response) => {
        // Handle the response data
        road = response.data.address.road;
        console.log("road value:", road);
        suburb = response.data.address.suburb;
        city = response.data.address.city;
        state = response.data.address.state;
        country = response.data.address.country;
        countryCode = response.data.address.countryCode;
        handleAddressData(
          phone,
          latitude,
          longitude,
          road,
          suburb,
          city,
          state,
          country,
          countryCode,
          res
        );

        res.redirect(`/user/${phone}/home`);
      })
      .catch((error) => {
        // Handle errors
        console.error("API Request Error:", error);
      });
  } catch (error) {
    console.error("Error saving location:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * @route GET /user/:phone/history-orders
 * @description Renders the user's order history page.
 * @param {string} phone - The user's phone number.
 * @returns {Object} The rendered order history page for users.
 */
app.get("/user/:phone/history-orders", verifyToken, async (req, res) => {
  console.log(req.params);
  const user = await User.findOne({ phone: req.params.phone }).populate(
    "order.orderId"
  );
  console.log(user.order);
  if (user) {
    res.send({ orders: user.order });
    // res.render("historyOrders", { user: user });
  } else {
    res.send("user not found");
  }
});

/**
 * @route GET /user/:phone/user-saved-data
 * @description Renders the page displaying the user's personal data.
 * @param {string} phone - The user's phone number.
 * @returns {Object} The rendered page with the user's personal data.
 */
app.get("/user/:phone/user-saved-data", async (req, res) => {
  const { phone } = req.params;
  const user = await User.findOne({ phone: req.params.phone }).populate(
    "order.orderId"
  );
  console.log(user);

  res.render("user-personal-data", { user });
});

/**
 * @route GET /user/:phone/home
 * @description Renders the user's home page.
 * @param {string} phone - The user's phone number.
 * @returns {Object} The rendered home page for users.
 */
app.get("/user/:phone/home", (req, res) => {
  const { phone } = req.params;
  res.render("user-data", { phone });
});

/**
 * @route GET /user/:phone/pricelist
 * @description Renders the price list page with available options for users.
 * @returns {Object} The rendered price list page.
 */
app.get("/user/:phone/pricelist", (req, res) => {
  try {
    // Read the price list data from the JSON file

    // Extract the price list based on the phone number (here, we just return the entire 'CLOTHES' list)
    // Change this to get the relevant price list based on the phone number

    res.status(200).json({ data: dataList.CLOTHES });
  } catch (err) {
    console.error("Error fetching price list:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


/**
 * @route POST /driver/login
 * @description Handles driver login by sending a verification code via SMS.
 * @param {string} phone - The driver's phone number.
 * @returns {Object} The response object or an error message.
 */
// app.post("/driver/login", async (req, res) => {
//   const phone = req.body.phone;
//   console.log("driver/login");
//   console.log(req.body);
//   const newphone = phone.substring(1); // Remove leading '+' if present
//   console.log(newphone);

//   try {
//     const driver = await Driver.findOne({ phone: newphone });
//     console.log(driver);

//     let verificationCode;
//     if (driver) {
//       verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
//       await Driver.updateOne({ phone: newphone }, { verificationCode });
//     } else {
//       // If driver is not found, send the error response and return to stop further code execution
//       return res.status(500).send("Not registered to login. Contact Admin");
//     }

//     // Send SMS using Nexmo
//     nexmo.message.sendSms(
//       "YourApp",
//       phone,
//       `Your verification code is: ${verificationCode}`,
//       (err, responseData) => {
//         if (err) {
//           console.error(err);
//           // If error in sending SMS, send the response and return
//           return res.status(500).json({
//             success: false,
//             message: "Failed to send verification code",
//           });
//         } else {
//           console.log(responseData);
//           // If successful, send the success response
//           return res.status(200).json({
//             success: true,
//             message: "Verification code sent successfully",
//           });
//         }
//       }
//     );
//   } catch (error) {
//     console.error("Error during login:", error);
//     // Send server error response
//     return res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// });



/**
 * @route GET /driver/register
 * @description Renders the driver registration page.
 * @returns {Object} The rendered registration page for drivers.
 */
app.get("/driver/register", (req, res) => {
  res.render("register", { type: "driver" });
});

/**
 * @route POST /driver/register
 * @description Handles driver registration, generates a verification code, and sends it via SMS.
 * @param {string} phone - The driver's phone number for registration.
 * @returns {Object} Redirects to the OTP verification page or displays an error message.
 */
app.post("/driver/register", async (req, res) => {
  const phone = req.body.phone;
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  try {
    // Check if the user already exists
    const existingUser = await Driver.findOne({ phone });

    if (existingUser) {
      // Inform the user that they are already registered
      // You might want to customize this message or show an alert box on the front end
      const alertMessage = "driver already registered. Please log in.";
      return res.send(
        `<script>alert('${alertMessage}'); window.location.href='/driver/login';</script>`
      );
    }

    // Create a new user if the user doesn't exist
    const newUser = await Driver.create({
      phone,
      verificationCode,
    });

    const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;

    nexmo.message.sendSms(
      "YourApp",
      phone,
      `Your verification code is: ${verificationCode}`,
      (err, responseData) => {
        if (err) {
          console.error(err);
          res.status(500).send("Failed to send verification code");
        } else {
          console.log(responseData);
          res.redirect(`/driver/${newUser.phone}/verify-otp`);
        }
      }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return res.redirect(`/driver/login`);
  }
});


/**
 * @route POST /driver/login
 * @description Handles driver login by sending a verification code via SMS.
 * @param {string} phone - The driver's phone number.
 * @returns {Object} The response object or an error message.
 */
app.post("/driver/login", async (req, res) => {
  const phone = req.body.phone;
  console.log("driver/login");
  console.log(req.body);
  const newphone = phone.substring(1); // Remove leading '+' if present
  console.log(newphone);

  try {
    const driver = await Driver.findOne({ phone:newphone, isVerified: true });
    console.log("Driver found:", driver);

    if (driver) {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      await Driver.updateOne({ phone:newphone }, { verificationCode });

      const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;

      nexmo.message.sendSms(
        "YourApp",
        phone,
        `Your verification code is: ${verificationCode}`,
        (err, responseData) => {
          if (err) {
            console.error("Nexmo error:", err);
            return res.status(500).send("Failed to send verification code");
          } else {
            console.log("Nexmo response:", responseData);
            return res.status(200).json({
              success: true,
              message: "Driver found and verification code sent successfully"
            });
                    }
        }
      );
    } else {
      console.log("Driver not registered or not verified.");
      return res.status(401).send("Not registered or unverified driver");
    }
  } catch (error) {
    console.error("Error during login:", error.message); // Log the error message
    console.error(error); // Log the full error object for more context
    return res.status(500).send("Internal Server Error");
  }
});


/**
 * @route GET /driver/:phone/orderList
 * @description Renders the page for updating order details by drivers.
 * @param {string} phone - The driver's phone number.
 * @returns {Object} The rendered order update page for drivers.
 */
app.get("/driver/:phone/orderList", (req, res) => {
  //build an page for order update
  console.log(req.params);
  res.render("orderListDriver", {
    data: data,
    phone: req.params.phone,
  });
});

/**
 * @route GET /user/:phone/order/:orderId/saveAmount
 * @description Renders the payment page for users.
 * @param {string} phone - The user's phone number.
 * @param {string} orderId - The ID of the order.
 * @returns {Object} The rendered payment page with EJS template.
 */
app.get(
  "/user/:phone/order/:orderId/saveAmount",
  verifyToken,
  async (req, res) => {
    const { phone, orderId } = req.params;
    console.log(req.params);

    try {
      const razorpayOrderId = await razorpay.orders.fetch(orderId);
      console.log("razorpayOrderId:", razorpayOrderId);
      const amount = razorpayOrderId.amount;

      // Render the make-payment page with EJS template
      res.render("razorpay", { phone, orderId, amount });
    } catch (error) {
      console.error("Error fetching Razorpay order:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @route GET /user/:phone/order/:orderId/payment
 * @description Renders the payment page for users.
 * @param {string} phone - The user's phone number.
 * @param {string} orderId - The ID of the order.
 * @returns {Object} The rendered payment page with EJS template.
 */
app.get("/user/:phone/order/:orderId/payment", verifyToken, (req, res) => {
  const { phone, orderId } = req.params;

  // Render the make-payment page with EJS template
  res.render("make-payment", { phone, orderId });
});

/**
 * @route POST /user/:phone/order/:orderId/saveAmount
 * @description Saves the paid amount to the backend for an order.
 * @param {string} phone - The user's phone number.
 * @param {string} orderId - The ID of the order.
 * @param {Object} req.body - The request body containing the paid amount.
 * @returns {Object} The response object or an error message.
 */
app.post(
  "/user/:phone/order/:orderId/saveAmount",
  verifyToken,
  async (req, res) => {
    const { phone, orderId } = req.params;
    const { amount } = req.body;
    console.log("saveAmount");
    console.log(req.params);
    console.log("saveAmountserverside:", req.body);

    try {
      if (amount === undefined || amount === 0) {
        console.log("Amount data is not found or is zero");
        return res
          .status(400)
          .json({ error: "Amount data is not found or is zero" });
      }

      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency: "INR",
        receipt: `order_${orderId}`,
      };
      console.log(options);

      const razorpayOrder = await razorpay.orders.create(options);

      // For simplicity, here we are sending the Razorpay order ID as JSON
      res.json({ razorpayOrderId: razorpayOrder.id });
    } catch (error) {
      console.error("Error saving amount on the backend:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @route POST /user/:phone/order/:orderId/payment
 * @description Handles the payment process for users.
 * @param {string} phone - The user's phone number.
 * @param {string} orderId - The ID of the order.
 * @param {Object} req.body - The request body containing the payment details.
 * @returns {Object} The response object or an error message.
 */
app.post(
  "/user/:phone/order/:orderId/payment",
  verifyToken,
  async (req, res) => {
    const { phone, orderId } = req.params;
    const { amount } = req.body;
    console.log("payment");
    console.log(req.params);
    console.log(req.body);
    console.log("uuid.v4: ");
    const razorpayId = uuid.v4();
    console.log(razorpayId);

    try {
      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency: "INR",
        receipt: `p${razorpayId}`,
      };
      console.log(options);

      const razorpayOrder = await razorpay.orders.create(options);
      console.log("razorpayOrder:", razorpayOrder);

      res.redirect(`/user/${phone}/order/${razorpayOrder.id}/saveAmount`);

      const order = await Order.findById(orderId);
      console.log(order);
      if (order) {
        const paidAmount = parseFloat(amount);
        const remainingUnpaid = order.payment.totalUnpaid - paidAmount;
        const totalPaid = order.payment.totalPaid + paidAmount;

        // Update order's payment details
        await Order.updateOne(
          { _id: orderId },
          {
            $set: {
              "payment.totalPaid": totalPaid,
              "payment.totalUnpaid": remainingUnpaid,
            },
          }
        );
        console.log("Payment details updated successfully.");
      } else {
        console.error("Order not found for payment update.");
      }
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @route GET /driver/:phone/verify-otp
 * @description Renders the OTP verification page for drivers.
 * @param {string} phone - The driver's phone number.
 * @returns {Object} The rendered OTP verification page for drivers.
 */
app.get("/driver/:phone/verify-otp", (req, res) => {
  console.log(req.params);
  const { phone } = req.params;
  res.render("verify-otp", { phone: phone, user: "driver" });
});

/**
 * @route POST /driver/:phone/verify-otp
 * @description Handles OTP verification for drivers.
 * @param {string} phone - The driver's phone number.
 * @param {Object} req.body - The request body containing the verification code.
 * @returns {Object} Redirects to the driver's home page or displays an error message.
 */
app.post("/driver/:phone/verify-otp", async (req, res) => {
  const { phone, verificationCode } = req.body;

  try {
    console.log("verify-otp");
    console.log(req.body);
    console.log(req.body);

    const driver = await Driver.findOne({ phone, verificationCode });
    console.log(driver);
    console.log(driver);

    if (driver) {
      console.log(driver.address);
        res.json({
          message: "Verification successful",
        });
      
    } else {
      res.status(401).send("Invalid verification code");
    }
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * @function handleAddressData
 * @description Updates the user's address information in the backend.
 * @param {string} phone - The user's phone number.
 * @param {string} latitude - The latitude of the address.
 * @param {string} longitude - The longitude of the address.
 * @param {string} road - The road of the address.
 * @param {string} suburb - The suburb of the address.
 * @param {string} city - The city of the address.
 * @param {string} state - The state of the address.
 * @param {string} country - The country of the address.
 * @param {string} countryCode - The country code of the address.
 * @param {Object} res - The response object.
 */
async function handleAddressData(
  phone,
  latitude,
  longitude,
  road,
  suburb,
  city,
  state,
  country,
  countryCode,
  res
) {
  console.log("road value outside axios:", road);

  const result = await User.updateOne(
    { phone },
    {
      $set: {
        address: {
          latitude,
          longitude,
          road,
          suburb,
          city,
          state,
          country,
          countryCode,
          isFilled: true,
        },
      },
    }
  );
  console.log(result);
  console.log(
    latitude,
    longitude,
    road,
    suburb,
    city,
    state,
    country,
    countryCode
  );
  if (result.acknowledged) {
    console.log("Location saved successfully.");

    console.log("result done");
    console.log(result);
    console.log(phone);
  } else {
    console.error("Failed to save location.");
    res.status(500).send("Failed to save location");
  }
}

/**
 * @route GET /driver/:phone/salary
 * @description Renders the salary page for drivers.
 * @param {string} phone - The driver's phone number.
 * @returns {Object} The rendered salary page.
 */
app.get("/driver/:phone/salary", (req, res) => {
  // Render the salary page

  res.render("driver-salary", { driverPhone: req.params.phone });
});

/**
 * @route GET /driver/:phone/history-orders
 * @description Renders the history of orders page for drivers.
 * @param {string} phone - The driver's phone number.
 * @returns {Object} The rendered history of orders page.
 */
// app.get("/driver/:phone/history-orders", (req, res) => {
//   // Render the history of orders page
//   // res.render("driver-history-orders", { driverPhone: req.params.phone });
// });

 /**
 * @route POST /driver/:phone/history-orders
 * @description Handles post requests for the history of orders page for drivers, without considering driver ID.
 * @param {Object} req.body - The request body.
 * @param {string} phone - The driver's phone number.
 */
 app.get("/driver/:phone/history-orders", async (req, res) => {
  console.log("started");
  try {
    // const { phone } = req.params;
    // console.log("phone");
    // console.log(phone);


    // Fetch all orders associated with this phone number
    const orders = await Order.find().populate('userId');
    console.log("orders");
    console.log(orders);

    if (orders.length === 0) {
      // Send response if no orders are found and return to prevent further execution
      return res.status(404).json({ message: "No orders found" });
    }

    // Send response with the orders
    return res.status(200).json({ orders });

  } catch (error) {
    console.error("Error fetching orders:", error);
    // Handle server error and return response
    return res.status(500).json({ message: "Server error" });
  }
});



/**
 * @route GET /driver/:phone/history-pickup-orders
 * @description Renders the history of pickup orders page for drivers.
 * @param {string} phone - The driver's phone number.
 * @returns {Object} The rendered history of pickup orders page.
 */
app.get("/driver/:phone/history-pickup-orders", async (req, res) => {
  try {
    

    // Assuming driver has a pickupOrder array
    const pickupOrders = driver.pickupOrder || [];
    console.log(pickupOrders);
    res.status(200).json(pickupOrders);

    // res.render("driver-history-orders", {
    //   pickupOrders,
    //   driverPhone: req.params.phone,
    // });
  } catch (error) {
    console.error("Error fetching driver and pickup orders:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * @route GET /driver/:phone/confirm-pickup
 * @description Renders the confirm pickup page for drivers, displaying eligible orders for pickup.
 * @param {string} phone - The driver's phone number.
 * @returns {Object} The rendered confirm pickup page with eligible orders.
 */
app.get("/driver/:phone/confirm-pickup", async (req, res) => {
  // Render the confirm pickup page
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight for accurate date comparison

    // Find orders with pickup date equal to today and isPickedUp is either 'false' or not present
    const orders = await Order.find({
      $or: [
        { isDriverConfirmed: { $exists: false } }, // If isPickedUp is not present
        { isDriverConfirmed: false }, // If isPickedUp is 'false'
      ],
    }).populate("userId");
    if (orders.length === 0) {
      return res.send("No eligible orders for pickup today");
    }
    res.status(200).send(orders);
    // res.render("driver-confirm-pickup", {
    //   driverPhone: req.params.phone,
    //   orders,
    // });
  } catch (error) {
    console.error("Error fetching orders and updating driver:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * @route GET /driver/:phone/home
 * @description Renders the driver dashboard page.
 * @param {string} phone - The driver's phone number.
 * @returns {Object} The rendered driver dashboard page.
 */
app.get("/driver/:phone/home", (req, res) => {
  res.render("driver-dashboard", { driver: req.params });
});

/**
 * @route POST /driver/:phone/confirm-pickup/:orderId
 * @description Handles the confirmation of order pickup by a driver.
 * @param {string} phone - The driver's phone number.
 * @param {string} orderId - The ID of the order to confirm pickup.
 * @returns {Object} Redirects to the driver's home page or displays an error message.
 */
app.post("/driver/:phone/confirm-pickup/:orderId", async (req, res) => {
  const { phone, orderId } = req.params;

  try {
    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      return res.status(404).send("Order not found");
    }

    const driver = await Driver.findOne({ phone, isVerified: true });

    if (!driver) {
      return res.status(404).send("Driver not found or not verified");
    }

    const pickupOrder = {
      orderId: order._id,
      date: new Date(),
    };

    // Add pickupOrder to the driver's pickupOrder array
    await Driver.updateOne({ phone }, { $push: { pickupOrder } });

    // Update the order's status or perform any other necessary actions
    console.log(driver._id);
    await Order.updateOne(
      { _id: orderId },
      { $set: { isDriverConfirmed: true, pickupDriverId: driver._id } }
    );

    return res.redirect(`/driver/${phone}/home`);
  } catch (error) {
    console.error("Error fetching orders and updating driver:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * @route GET /driver/:phone/edit-order-list/:orderList
 * @description Renders the page for editing an order list by a driver.
 * @param {string} phone - The driver's phone number.
 * @param {string} orderList - The ID of the order list to edit.
 * @returns {Object} The rendered order list editing page with order details.
 */
app.get("/driver/:phone/edit-order-list/:orderList", async (req, res) => {
  const { phone, orderList } = req.params;
  try {
    console.log(req.params);
    console.log(typeof orderList);
    const mongooseOrderList = new mongoose.Types.ObjectId(orderList);
    console.log(mongooseOrderList);
    console.log(typeof mongooseOrderList);
    const driverid = await Driver.findOne({ phone });
    console.log(driverid);

    const existingOrder = await Order.findOne({ _id: mongooseOrderList });
    console.log(existingOrder, dataList);
    res.json({ existingOrder, dataList });
  } catch (error) {
    console.error("Error fetching orders and updating driver:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route POST /driver/:phone/orderList/:orderList
 * @description Handles the submission of an updated order list by a driver.
 * @param {string} phone - The driver's phone number.
 * @param {string} orderList - The ID of the order list to update.
 * @param {Object} req.body - The request body containing the updated order details.
 * @returns {Object} Redirects to the driver's home page or displays an error message.
 */
app.post("/driver/:phone/orderList/:orderList", async (req, res) => {
  const nonZeroValues = {};
  let total = 0;
  let outputString = "";
  let orderList1 = [];

  const { phone, orderList } = req.params;

  console.log(orderList);
  console.log(typeof orderList);
  const mongooseOrderList = new mongoose.Types.ObjectId(orderList);
  console.log(mongooseOrderList);
  console.log(typeof mongooseOrderList);
  console.log(req.body);

  for (const key in req.body) {
    if (req.body.hasOwnProperty(key)) {
      const value = req.body[key];

      if (value !== "0") {
        nonZeroValues[key] = value;
        console.log(key);
      }
    }
  }

  for (const key in nonZeroValues) {
    console.log(
      `the item no ${key} has ${nonZeroValues[key].quantity} quantity`
    );
    const foundItem = dataList.CLOTHES.find(
      (list) => list.ID === parseInt(key)
    );
    console.log(`Item with ID ${key} found:`, foundItem);
    if (foundItem) {
      total = total + foundItem.PRICE * nonZeroValues[key].quantity;
      try {
        orderList1.push({
          itemId: key,
          items: foundItem.NAME,
          service: foundItem.OPERATION,
          quantity: nonZeroValues[key].quantity,
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
          nonZeroValues[key].quantity;
      } else {
        outputString =
          outputString +
          "," +
          JSON.stringify(foundItem) +
          " with the quantity of " +
          nonZeroValues[key].quantity;
      }
    }
  }

  try {
    const result = await Order.updateOne(
      { _id: mongooseOrderList },
      {
        orders: orderList1,
      }
    );
    console.log(orderList1);
    res.status(200).json({ message: "Order list updated successfully" });
    console.log("success app value");
  } catch (error) {
    console.log("error");
    console.log(error);
  }
});

/**
 * @route GET /test
 * @description A placeholder route for testing purposes.
 */
app.get("/test", (req, res) => {});

// Route to initiate a payment
app.post("/create-payment", async (req, res) => {
  const { amount, currency, receipt, notes } = req.body;
  console.log(req.body);

  try {
    const orderOptions = {
      amount: parseFloat(amount) * 100, // Razorpay expects amount in paise
      currency,
      receipt,
      notes,
    };

    const order = await razorpay.orders.create(orderOptions);

    res.json({ orderId: order.id, amount: order.amount });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to handle payment success
app.post("/payment-success", (req, res) => {
  const { paymentId, orderId, signature } = req.body;

  // Verify the payment signature
  const isValidSignature = razorpay.verifyPaymentSignature({
    orderId,
    paymentId,
    signature,
  });

  if (isValidSignature) {
    res.json({ success: true, message: "Payment successful" });
  } else {
    res
      .status(400)
      .json({ success: false, message: "Invalid payment signature" });
  }
});

/**
 * @route POST /user/:phone/updateAddress
 * @description Updates the address details for a user identified by their phone number.
 * @param {string} phone - The user's phone number.
 * @param {Object} req.body - The request body containing the updated address details.
 * @param {string} req.body.latitude - The latitude of the new address.
 * @param {string} req.body.longitude - The longitude of the new address.
 * @param {string} req.body.road - The road name of the new address.
 * @param {string} req.body.suburb - The suburb of the new address.
 * @param {string} req.body.city - The city of the new address.
 * @param {string} req.body.state - The state of the new address.
 * @param {string} req.body.country - The country of the new address.
 * @param {string} req.body.countryCode - The country code of the new address.
 * @returns {Object} - Returns a JSON object with a success message and the updated user details, or an error message.
 */
app.post("/user/:phone/updateAddress", verifyToken, async (req, res) => {
  const { phone } = req.params;
  const {
    latitude,
    longitude,
    streetName,
    areaName,
    cityName,
    zipCode,
    stateName,
    countryName,
    userApartmentName,
    userStreetName,
    userLandmark
  } = req.body;

  try {
    let user = await User.findOne({ phone });
    console.log(req.body);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.address = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      streetName,
      areaName,
      cityName,
      zipCode,
      stateName,
      countryName,
      userApartmentName,
      userStreetName,
      userLandmark,
      isFilled: true,
    };
    console.log("address is added");

    await user.save();
    console.log("address is saved");

    res.status(200).json({ message: "Address updated successfully", user });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ message: "Failed to update address" });
  }
});


app.post('/driver/:phone/driver-pickup1', async (req, res) => {
  const { phone } = req.params;  // Extract driver phone number from URL
  const { order } = req.body;    // Extract order ID from request body

  try {
    // Find the order by ID
    const orderData = await Order.findById(order);
    if (!orderData) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Find the driver by phone number
    const driverData = await Driver.findOne({ phone });
    if (!driverData) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Update the order with pickupDriverId
    orderData.pickupDriverId = driverData._id;
    orderData.isDriverConfirmed = true;  // Set driver confirmation
    await orderData.save();

    // Update the driver with the order in pickupOrder array
    driverData.pickupOrder.push({
      orderId: orderData._id,
    });
    await driverData.save();

    res.json({ message: 'Driver pickup confirmed and order updated' });
  } catch (error) {
    console.error('Error updating order and driver:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/driver/:phone/driver-delivery1', async (req, res) => {
  const { phone } = req.params;  // Extract driver phone number from URL
  const { order } = req.body;    // Extract order ID from request body

  try {
    // Find the order by ID
    const orderData = await Order.findById(order);
    if (!orderData) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Find the driver by phone number
    const driverData = await Driver.findOne({ phone });
    if (!driverData) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Update the order with deliveryDriverId
    orderData.deliveryDriverId = driverData._id;
    orderData.isDeliveryPickuped = true;  // Set driver confirmation
    await orderData.save();

    // Update the driver with the order in pickupOrder array
    driverData.deliveryOrder.push({
      orderId: orderData._id,
      date: new Date()  // Add current date for the pickup order
    });
    await driverData.save();

    res.json({ message: 'Driver pickup confirmed and order updated' });
  } catch (error) {
    console.error('Error updating order and driver:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/driver/:phone/order/:orderId/reached-location', async (req, res) => {
  const { phone, orderId } = req.params;

  try {
    // Find the order by orderId
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update the order with the "isPickedUpReached" flag
    order.isPickedUpReached = true;
    await order.save();

    // Optionally, update driver record or log reaching location, etc.
    const driver = await Driver.findOne({ phone });
    if (driver) {
      // You can add logic to update the driver record or other business logic here
      console.log(`Driver ${phone} reached the location for order ${orderId}`);
    }

    return res.status(200).json({ message: 'Order status updated to reached location', order });
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/driver/:phone/order/:orderId/', async (req, res) => {
  const { phone, orderId } = req.params;

  try {
    // Find the order by orderId
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update the order with the "isPickedUpReached" flag
    // Optionally, update driver record or log reaching location, etc.
    const driver = await Driver.findOne({ phone });
    if (driver) {
      // You can add logic to update the driver record or other business logic here
      console.log(`Driver ${phone} reached the location for order ${orderId}`);
    }

    return res.status(200).json({ message: 'Order status updated to reached location', order });
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


// Route to fetch a specific order for a driver by phone and orderId
app.get('/driver/:phone/order/:orderId', async (req, res) => {
  const { phone, orderId } = req.params;

  try {
    // Find the driver using the phone number
    const driver = await Driver.findOne({ phone });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Find the order using the orderId and confirm the driver is assigned to it
    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not assigned to this driver' });
    }

    // Respond with the order details
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/driver/:phone/orders/:orderId', async (req, res) => {
  const { phone, orderId } = req.params;
  const { orders, totalPrice,isPaid } = req.body;
  console.log("req.body",req.body)

  try {
    // Find the driver by phone number
    const driver = await Driver.findOne({ phone });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update the orders array by appending new items
    order.orders = orders;


    // Update the total price
    order.totalPrice = totalPrice;
    order.isPickedUp=true;
    order.isPaid=isPaid;
    console.log("order:".order)

    // Save the updated order
    await order.save();

    return res.status(200).json({ message: 'Order updated successfully', order });
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});






/**
 * @listen
 * @description Starts the server and listens on the specified port.
 * @param {number} port - The port number on which the server will run.
 * @returns {Object} Logs the server URL to the console.
 */
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
