// Importing required modules and libraries
const express = require("express"); // Express.js for building the web application
const mongoose = require("mongoose"); // Mongoose for MongoDB integration
const bodyParser = require("body-parser"); // Body-parser for parsing incoming request bodies
const session = require("express-session"); // Express-session for managing user sessions
const fs = require("fs").promises; // Promisified file system module for reading files
const { readFileSync } = require("fs"); // Synchronous file read function
const DateTimeSlots = require("date-time-slots").default; // Library for managing date and time slots
const axios = require("axios"); // Axios for making HTTP requests
const { ObjectId } = require("mongodb"); // MongoDB ObjectId for unique identifiers
const Razorpay = require("razorpay"); // Razorpay for payment processing
const uuid = require("uuid");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const {verifyToken,verifyDriverToken} = require('./middlewares/verifyToken'); // Example for using a middleware

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

//  Import routes
const userRoutes = require('./routes/userRoutes');
const driverRoutes = require('./routes/driverRoutes');
const Order = require("./models/orderModel");
const orderRoutes = require(`./models/orderModel`);
// const paymentRoutes = require('./routes/paymentRoutes');
// const testRoutes = require('./routes/testRoutes');

// Use routes
app.use('/user', userRoutes);
app.use('/driver', driverRoutes);
app.use('/order', orderRoutes);
// app.use('/payment', paymentRoutes);
// app.use('/test', testRoutes);


/**
 * @route GET /
 * @description Renders the home page for user interaction.
 * @returns {Object} The rendered home page.
 */
app.get("/", (req, res) => {
  res.render("home", { type: "user" });
});

/**
 * @route GET /driver/:phone/orderList
 * @description Renders the page for updating order details by drivers.
 * @param {string} phone - The driver's phone number.
 * @returns {Object} The rendered order update page for drivers.
 */
// app.get("/driver/:phone/orderList", (req, res) => {
//   //build an page for order update
//   console.log(req.params);
//   res.render("orderListDriver", {
//     data: data,
//     phone: req.params.phone,
//   });
// });

/**
 * @route POST /driver/:phone/verify-otp
 * @description Handles OTP verification for drivers.
 * @param {string} phone - The driver's phone number.
 * @param {Object} req.body - The request body containing the verification code.
 * @returns {Object} Redirects to the driver's home page or displays an error message.
 */
// app.post("/driver/:phone/verify-otp", async (req, res) => {
//   const { phone, verificationCode } = req.body;

//   try {
//     console.log("verify-otp");
//     console.log(req.body);
//     console.log(req.body);

//     const driver = await Driver.findOne({ phone, verificationCode });
//     console.log(driver);
//     console.log(driver);

//     if (driver) {
//       console.log(driver.address);
//       // Generate JWT token

//       const token = jwt.sign(
//         { _id: driver._id.toString(), phone: driver.phone },

//         secretKey
//       );

//       // Store the token in the database

//       driver.tokens = driver.tokens.concat({ token });
//       await driver.save();
//       res.json({
//         message: "Verification successful",
//         token,
//       });
//     } else {
//       res.status(401).send("Invalid verification code");
//     }
//   } catch (error) {
//     console.error("Error during OTP verification:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });


/**
 * @route GET /driver/:phone/salary
 * @description Renders the salary page for drivers.
 * @param {string} phone - The driver's phone number.
 * @returns {Object} The rendered salary page.
 */
// app.get("/driver/:phone/salary", (req, res) => {
//   // Render the salary page

//   res.render("driver-salary", { driverPhone: req.params.phone });
// });

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
 * @route GET /driver/:phone/history-pickup-orders
 * @description Renders the history of pickup orders page for drivers.
 * @param {string} phone - The driver's phone number.
 * @returns {Object} The rendered history of pickup orders page.
 */
// app.get("/driver/:phone/history-pickup-orders", async (req, res) => {
//   try {
//     // Assuming driver has a pickupOrder array
//     const pickupOrders = driver.pickupOrder || [];
//     console.log(pickupOrders);
//     res.status(200).json(pickupOrders);

//     // res.render("driver-history-orders", {
//     //   pickupOrders,
//     //   driverPhone: req.params.phone,
//     // });
//   } catch (error) {
//     console.error("Error fetching driver and pickup orders:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

/**
 * @route GET /driver/:phone/confirm-pickup
 * @description Renders the confirm pickup page for drivers, displaying eligible orders for pickup.
 * @param {string} phone - The driver's phone number.
 * @returns {Object} The rendered confirm pickup page with eligible orders.
 */
// app.get("/driver/:phone/confirm-pickup", async (req, res) => {
//   // Render the confirm pickup page
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // Set time to midnight for accurate date comparison

//     // Find orders with pickup date equal to today and isPickedUp is either 'false' or not present
//     const orders = await Order.find({
//       $or: [
//         { isDriverConfirmed: { $exists: false } }, // If isPickedUp is not present
//         { isDriverConfirmed: false }, // If isPickedUp is 'false'
//       ],
//     }).populate("userId");
//     if (orders.length === 0) {
//       return res.send("No eligible orders for pickup today");
//     }
//     res.status(200).send(orders);
//     // res.render("driver-confirm-pickup", {
//     //   driverPhone: req.params.phone,
//     //   orders,
//     // });
//   } catch (error) {
//     console.error("Error fetching orders and updating driver:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });


/**
 * @route POST /driver/:phone/confirm-pickup/:orderId
 * @description Handles the confirmation of order pickup by a driver.
 * @param {string} phone - The driver's phone number.
 * @param {string} orderId - The ID of the order to confirm pickup.
 * @returns {Object} Redirects to the driver's home page or displays an error message.
 */
// app.post("/driver/:phone/confirm-pickup/:orderId", verifyDriverToken, async (req, res) => {
//   const { phone, orderId } = req.params;

//   try {
//     const order = await Order.findOne({ _id: orderId });

//     if (!order) {
//       return res.status(404).send("Order not found");
//     }

//     const driver = await Driver.findOne({ phone, isVerified: true });

//     if (!driver) {
//       return res.status(404).send("Driver not found or not verified");
//     }

//     const pickupOrder = {
//       orderId: order._id,
//       date: new Date(),
//     };

//     // Add pickupOrder to the driver's pickupOrder array
//     await Driver.updateOne({ phone }, { $push: { pickupOrder } });

//     // Update the order's status or perform any other necessary actions
//     console.log(driver._id);
//     await Order.updateOne(
//       { _id: orderId },
//       { $set: { isDriverConfirmed: true, pickupDriverId: driver._id } }
//     );

//     return res.redirect(`/driver/${phone}/home`);
//   } catch (error) {
//     console.error("Error fetching orders and updating driver:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

/**
 * @route GET /driver/:phone/edit-order-list/:orderList
 * @description Renders the page for editing an order list by a driver.
 * @param {string} phone - The driver's phone number.
 * @param {string} orderList - The ID of the order list to edit.
 * @returns {Object} The rendered order list editing page with order details.
 */
// app.get("/driver/:phone/edit-order-list/:orderList", async (req, res) => {
//   const { phone, orderList } = req.params;
//   try {
//     console.log(req.params);
//     console.log(typeof orderList);
//     const mongooseOrderList = new mongoose.Types.ObjectId(orderList);
//     console.log(mongooseOrderList);
//     console.log(typeof mongooseOrderList);
//     const driverid = await Driver.findOne({ phone });
//     console.log(driverid);

//     const existingOrder = await Order.findOne({ _id: mongooseOrderList });
//     console.log(existingOrder, dataList);
//     res.json({ existingOrder, dataList });
//   } catch (error) {
//     console.error("Error fetching orders and updating driver:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

/**
 * @route POST /driver/:phone/orderList/:orderList
 * @description Handles the submission of an updated order list by a driver.
 * @param {string} phone - The driver's phone number.
 * @param {string} orderList - The ID of the order list to update.
 * @param {Object} req.body - The request body containing the updated order details.
 * @returns {Object} Redirects to the driver's home page or displays an error message.
 */
// app.post("/driver/:phone/orderList/:orderList", verifyDriverToken,  async (req, res) => {
//   const nonZeroValues = {};
//   let total = 0;
//   let outputString = "";
//   let orderList1 = [];

//   const { phone, orderList } = req.params;

//   console.log(orderList);
//   console.log(typeof orderList);
//   const mongooseOrderList = new mongoose.Types.ObjectId(orderList);
//   console.log(mongooseOrderList);
//   console.log(typeof mongooseOrderList);
//   console.log(req.body);

//   for (const key in req.body) {
//     if (req.body.hasOwnProperty(key)) {
//       const value = req.body[key];

//       if (value !== "0") {
//         nonZeroValues[key] = value;
//         console.log(key);
//       }
//     }
//   }

//   for (const key in nonZeroValues) {
//     console.log(
//       `the item no ${key} has ${nonZeroValues[key].quantity} quantity`
//     );
//     const foundItem = dataList.CLOTHES.find(
//       (list) => list.ID === parseInt(key)
//     );
//     console.log(`Item with ID ${key} found:`, foundItem);
//     if (foundItem) {
//       total = total + foundItem.PRICE * nonZeroValues[key].quantity;
//       try {
//         orderList1.push({
//           itemId: key,
//           items: foundItem.NAME,
//           service: foundItem.OPERATION,
//           quantity: nonZeroValues[key].quantity,
//         });
//         console.log("New order added to the list");
//         console.log(foundItem.NAME);
//       } catch (error) {
//         console.error("Error adding order to the list:", error);
//         return res.status(500).send("Internal Server Error");
//       }

//       if (outputString === "") {
//         outputString =
//           JSON.stringify(foundItem) +
//           " with the quantity of " +
//           nonZeroValues[key].quantity;
//       } else {
//         outputString =
//           outputString +
//           "," +
//           JSON.stringify(foundItem) +
//           " with the quantity of " +
//           nonZeroValues[key].quantity;
//       }
//     }
//   }

//   try {
//     const result = await Order.updateOne(
//       { _id: mongooseOrderList },
//       {
//         orders: orderList1,
//       }
//     );
//     console.log(orderList1);
//     res.status(200).json({ message: "Order list updated successfully" });
//     console.log("success app value");
//   } catch (error) {
//     console.log("error");
//     console.log(error);
//   }
// });

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





app.post("/driver/:phone/order/:orderId/", verifyDriverToken,  async (req, res) => {
  const { phone, orderId } = req.params;

  try {
    // Find the order by orderId
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the order with the "isPickedUpReached" flag
    // Optionally, update driver record or log reaching location, etc.
    const driver = await Driver.findOne({ phone });
    if (driver) {
      // You can add logic to update the driver record or other business logic here
      console.log(`Driver ${phone} reached the location for order ${orderId}`);
    }

    return res
      .status(200)
      .json({ message: "Order status updated to reached location", order });
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});



app.post("/orders/:orderId/update-payment", async (req, res) => {
  const { orderId } = req.params;
  const { isPaid } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.isPaid = isPaid;
    console.log("order:", order);

    await order.save();
    return res
      .status(200)
      .json({ message: "Order updated successfully", order });
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({ message: "Internal server error" });
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
