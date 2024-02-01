const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const fs = require("fs").promises;
const { readFileSync } = require("fs");
const Nexmo = require("nexmo");
const DateTimeSlots = require("date-time-slots").default;
const axios = require("axios");
const { time } = require("console");
const Razorpay = require("razorpay");
const { ObjectId } = require("mongodb");

const razorpay = new Razorpay({
  key_id: "rzp_test_nHQwaBNHjTq16a",
  key_secret: "7ki8eeVXevjSkwXfsFMdLHXy",
});

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "your-secret-key",
    resave: true,
    saveUninitialized: true,
  })
);

const data = JSON.parse(readFileSync("./models/CLOTHLIST.json"));
const dataList = JSON.parse(readFileSync("./models/PRICE_FINAL_DATA.json"));
const pricelistdata = JSON.parse(readFileSync("./views/data.json"));
mongoose.connect("mongodb://localhost:27017/micTestApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//mongoose schema for user
const userSchema = new mongoose.Schema({
  phone: String,
  isVerified: { type: Boolean, default: false },
  verificationCode: String,
  order: [
    {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    },
  ],
  totalUnpaid:Number,
  totalPaid:Number,
  payzappId:{type:ObjectId},
  address: {
    latitude: Number,
    longitude: Number,
    road: String,
    suburb: String,
    city: String,
    state: String,
    country: String,
    countryCode: String,
    isFilled: { type: Boolean, default: false },
  },
});

const User = mongoose.model("customers", userSchema);

//mongoose schema for driver
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

const Driver = mongoose.model("driver", driverSchema);

//mongoose schema for order
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "customers" },
  orders: [
    {
      itemId: Number,
      items: String,
      service: String,
      quantity: Number,
    },
  ],
  totalPrice: Number,
  isPaid: { type: Boolean, default: false },
  payment: {
    totalPaid: { type: Number, default: 0 },
    totalUnpaid: { type: Number, default: 0 },
  },
  pickupDate: Date,
  deliveryDate: Date,
  pickupTime: String,
  deliveryTime: String,
  totalPrice: Number,
  isPickedUp: { type: Boolean, default: false },
  pickupDriverId: { type: mongoose.Schema.Types.ObjectId, ref: "driver" },
  isDriverConfirmed: { type: Boolean, default: false },
  isWorkStarted: { type: Boolean, default: false },
  isWorkCompleted: { type: Boolean, default: false },
  isDeliveryPickuped: { type: Boolean, default: false },
  deliveryDriverId: { type: mongoose.Schema.Types.ObjectId, ref: "driver" },
  isDelivered: { type: Boolean, default: false },
});

const Order = mongoose.model("Order", orderSchema);

//nexmo sms api
const nexmo = new Nexmo({
  apiKey: "21c82be4",
  apiSecret: "9KykD98D0TWZ7JGb",
});

app.set("view engine", "ejs");

app.use(express.static("views"));

let orderList = [];
let pickupDate, pickupTime, deliveryDate, deliveryTime;
let result1;

/* 
home page
*/
app.get("/", (req, res) => {
  res.render("home", { type: "user" });
});

/* 
login page functions
*/
app.get("/user/login", (req, res) => {
  res.render("login", { type: "user" });
});

app.post("/user/login", async (req, res) => {
  const phone = req.body.phone;

  try {
    const user = await User.findOne({ phone, isVerified: true });

    if (user) {
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      await User.updateOne({ phone }, { verificationCode });

      const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;

      nexmo.message.sendSms(
        "YourApp",
        formattedPhone,
        `Your verification code is: ${verificationCode}`,
        (err, responseData) => {
          if (err) {
            console.error(err);
            res.status(500).send("Failed to send verification code");
          } else {
            console.log(responseData);
            res.render("verify-otp", { phone, user: "user" });
          }
        }
      );
    } else {
      res.redirect("/user/register");
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/user/verify-otp", (req, res) => {
  res.render("verify-otp", { phone, user: "user" });
});

app.post("/user/:phone/verify-otp", async (req, res) => {
  const { phone, verificationCode } = req.body;

  try {
    const user = await User.findOne({ phone, verificationCode });

    if (user) {
      await User.updateOne({ phone }, { isVerified: true });
      console.log(user.address);
      if (user.address.isFilled === false) {
        let verify = res.redirect(`/user/${phone}/verify-address`);
      } else {
        res.redirect(`/user/${phone}/home`);
      }
    } else {
      res.status(401).send("Invalid verification code");
    }
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).send("Internal Server Error");
  }
});

/* 
order page functions
*/
app.get("/user/:phone/new-order", (req, res) => {
  console.log(req.params);
  console.log(req.session);

  res.redirect(`/user/${req.params.phone}/orderList`);
});

app.get("/user/:phone/orderList", (req, res) => {
  console.log("orderList get")
  console.log(req.params);
  let today = new Date();
  let test = new Date();
  let time;
  console.log(today.getHours());
  if (today.getHours() >= 16) {
    today.setDate(today.getDate() + 1);
  }
    day = today.getDate(),
    month = today.getMonth() + 1, //January is 0
    year = today.getFullYear();
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

app.post("/user/:phone/orderList", async (req, res) => {
  let nonZeroValues = {};
  let total = 0;
  let outputString = "";
  orderList = [];
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
    const foundItem = dataList.CLOTHES.find(
      (list) => list.ID === parseInt(key)
    );

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
    if (key == "pickupDate") {
      pickupDate = nonZeroValues[key];
      console.log("pickupDate");
      console.log(nonZeroValues[key]);
    }
    if (key == "pickupTime") {
      pickupTime = nonZeroValues[key];
      console.log("pickupTime");
      console.log(nonZeroValues[key]);
    }
    if (key == "deliveryDate") {
      deliveryDate = nonZeroValues[key];
    }
    if (key == "deliveryTime") {
      deliveryTime = nonZeroValues[key];
      console.log("deliveryTime");
      console.log(nonZeroValues[key]);
    }
  }

  try {
    const user = await User.findOne({ phone: req.params.phone });

    if (user) {
      console.log(Date.parse(pickupDate));
      console.log(pickupTime);
      console.log(Date.parse(deliveryDate));
      console.log(deliveryTime);
      result1 = await Order.create({
        userId: user._id,
        orders: orderList,
        pickupDate: Date.parse(pickupDate),
        pickupTime: pickupTime,
        deliveryDate: Date.parse(deliveryDate),
        deliveryTime: deliveryTime,
        totalPrice: total,
        payment: {
          totalPaid: 0, // Initialize totalPaid as 0 when creating the order
          totalUnpaid: total, // Initialize totalUnpaid with the total amount
        },
      });

      const result = await User.updateOne(
        { phone: req.params.phone },
        { $push: { order: { orderId: result1._id } } },
        { upsert: true }
      );

      //   console.log(result);

      console.log("result1");
      console.log(result1);

      if (result.acknowledged && result.modifiedCount === 1) {
        const modifiedOrderId = result1._id;
        return res.redirect(`/user/${req.params.phone}/order/${result1._id}/payment`);


        return res.send(result1);
      } else {
        console.error("Failed to update order");
        return res.status(500).send("Failed to update order");
      }
    } else {
      console.error("User not found");
      return res.status(404).send("User not found");
    }
  } catch (error) {
    console.log(pickupTime);
    console.log(deliveryTime);
    console.error("Error saving orders to MongoDB:", error);
    return res.status(500).send("Internal Server Error");
  }
});

/* 
user registeratiom page
*/
app.get("/user/register", (req, res) => {
  res.render("register", { type: "user" });
});

app.post("/user/register", async (req, res) => {
  const phone = req.body.phone;
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      // Inform the user that they are already registered
      // You might want to customize this message or show an alert box on the front end
      const alertMessage = "User already registered. Please log in.";
      return res.send(
        `<script>alert('${alertMessage}'); window.location.href='/user/login';</script>`
      );
    }

    // Create a new user if the user doesn't exist
    const newUser = await User.create({
      phone,
      verificationCode,
    });

    const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;

    nexmo.message.sendSms(
      "YourApp",
      formattedPhone,
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
    res.redirect("/user/login");
  }
});

/* 
verification page
*/
app.get("/user/:phone/verify-address", (req, res) => {
  res.render("verify-address", { phone: req.params.phone, type: "user" });
});
app.post("/user/:phone/verify-address", async (req, res) => {
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

app.get("/user/:phone/history-orders", async (req, res) => {
  console.log(req.params);
  const user = await User.findOne({ phone: req.params.phone }).populate(
    "order.orderId"
  );
  if (user) {
    res.render("historyOrders", { user: user });
  } else {
    res.send("user not found");
  }
});

app.get("/user/:phone/user-saved-data", async (req, res) => {
  const { phone } = req.params;
  const user = await User.findOne({ phone: req.params.phone }).populate(
    "order.orderId"
  );
  console.log(user);

  res.render("user-personal-data", { user });
});

app.get("/user/:phone/home", (req, res) => {
  const { phone } = req.params;
  res.render("user-data", { phone });
});
app.get("/user/:phone/pricelist", (req, res) => {
  console.log(dataList);
  res.render("pricelist", { data: dataList.CLOTHES });
});

app.get("/driver/login", (req, res) => {
  res.render("login", { type: "driver" });
});

app.post("/driver/login", async (req, res) => {
  const phone = req.body.phone;

  try {
    const driver = await Driver.findOne({ phone, isVerified: true });

    if (driver) {
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      await Driver.updateOne({ phone }, { verificationCode });

      const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;

      nexmo.message.sendSms(
        "YourApp",
        formattedPhone,
        `Your verification code is: ${verificationCode}`,
        (err, responseData) => {
          if (err) {
            console.error(err);
            res.status(500).send("Failed to send verification code");
          } else {
            console.log(responseData);
            res.render("verify-otp", { phone, user: "driver" });
          }
        }
      );
    } else {
      res.redirect("/driver/register");
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

/* 
user registeratiom page
*/
app.get("/driver/register", (req, res) => {
  res.render("register", { type: "driver" });
});

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
      formattedPhone,
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

/* 
login page functions
*/
app.get("/driver/login", (req, res) => {
  res.render("login", { type: "driver" });
});

app.post("/driver/login", async (req, res) => {
  const phone = req.body.phone;

  try {
    const driver = await Driver.findOne({ phone, isVerified: true });

    if (driver) {
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      await Driver.updateOne({ phone }, { verificationCode });

      const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;

      nexmo.message.sendSms(
        "YourApp",
        formattedPhone,
        `Your verification code is: ${verificationCode}`,
        (err, responseData) => {
          if (err) {
            console.error(err);
            res.status(500).send("Failed to send verification code");
          } else {
            console.log(responseData);
            res.render("verify-otp", { phone, user: "driver" });
          }
        }
      );
    } else {
      res.redirect("/driver/register");
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/driver/:phone/orderList", (req, res) => {
  //build an page for order update
  console.log(req.params);
  res.render("orderListDriver", {
    data: data,
    phone: req.params.phone,
  });
});

// Add this route to your existing Express application

app.get("/user/:phone/order/:orderId/payment", (req, res) => {
  const { phone, orderId } = req.params;

  // Render the make-payment page with EJS template
  res.render("make-payment", { phone, orderId });
});



app.post("/user/:phone/order/:orderId/saveAmount", async (req, res) => {
  const { phone, orderId } = req.params;
  const { amount } = req.body;
  console.log("saveAmount");
  console.log(req.params);
  console.log("saveAmountserverside:",req.body);


  try {
    // Save the amount to your backend (e.g., update a database)
    if (amount === undefined || amount === 0) {
      console.log("Amount data is not found or is zero");
    }
    
    else{
      console.log("amount is: ",amount)
    }
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `order_${orderId}`,
    };
    console.log(options);

    // ...
    const razorpayOrder = await razorpay.orders.create(options);

    // For simplicity, here we are sending the Razorpay order ID as JSON
    res.json({ razorpayOrderId: razorpayOrder.id });

  } catch (error) {
    console.error('Error saving amount on the backend:', error);
  res.status(500).json({ error: error.message });
  }
});

app.post("/user/:phone/order/:orderId/payment", async (req, res) => {
  const { phone, orderId } = req.params;
  const { amount } = req.body;
  console.log(req.params);
  console.log(req.body);

  try {
    // Create a Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `order_${orderId}`,
    };
    console.log(options);

    const razorpayOrder = await razorpay.orders.create(options);

    // Now, you have the Razorpay order, and you can pass its ID to the client-side
    // for further processing (e.g., using Razorpay.js on the frontend)

    // For simplicity, here we are sending the Razorpay order ID as JSON
    res.json({ razorpayOrderId: razorpayOrder.id });
    // Deduct the paid amount from the unpaid amount and update the order
    const order = await Order.findById(orderId);

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
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/driver/:phone/verify-otp", (req, res) => {
  console.log(req.params);
  const { phone } = req.params;
  res.render("verify-otp", { phone: phone, user: "driver" });
});

app.post("/driver/:phone/verify-otp", async (req, res) => {
  const { phone, verificationCode } = req.body;
  console.log(req.params);
  console.log(req.body);

  try {
    const driver = await Driver.findOne({ phone, verificationCode });

    if (driver) {
      await Driver.updateOne({ phone }, { isVerified: true });
      // Note: You don't need a separate variable here unless you plan to use it later
      res.redirect(`/driver/${phone}/home`);
    } else {
      res.status(401).send("Invalid verification code");
    }
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).send("Internal Server Error");
  }
});
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
// Example routes for driver actions
app.get("/driver/:phone/salary", (req, res) => {
  // Render the salary page

  res.render("driver-salary", { driverPhone: req.params.phone });
});

app.get("/driver/:phone/history-orders", (req, res) => {
  // Render the history of orders page
  res.render("driver-history-orders", { driverPhone: req.params.phone });
});
app.post("/driver/:phone/history-orders", async (req, res) => {
  console.log(req.body);
  console.log(req.params);
});
// Example route for rendering driver pickup order history
app.get("/driver/:phone/history-pickup-orders", async (req, res) => {
  try {
    const driver = await Driver.findOne({ phone: req.params.phone }).populate(
      "pickupOrder.orderId"
    );

    if (!driver) {
      return res.status(404).send("Driver not found");
    }

    // Assuming driver has a pickupOrder array
    const pickupOrders = driver.pickupOrder || [];
    console.log(pickupOrders);

    res.render("driver-history-orders", {
      pickupOrders,
      driverPhone: req.params.phone,
    });
  } catch (error) {
    console.error("Error fetching driver and pickup orders:", error);
    res.status(500).send("Internal Server Error");
  }
});

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
    res.render("driver-confirm-pickup", {
      driverPhone: req.params.phone,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders and updating driver:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/driver/:phone/home", (req, res) => {
  res.render("driver-dashboard", { driver: req.params });
});
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

// ...

app.get("/driver/:phone/edit-order-list/:orderList", async (req, res) => {
  const { phone, orderList } = req.params;
  try {
    existingOrder = await Order.findOne({ _id: orderList });
    console.log(existingOrder);
    let quantity = 0;
    res.render("orderListDriver", {
      data: data,
      existingOrder: existingOrder,
      quantity: quantity,
      phone: phone,
    });
  } catch (error) {
    console.error("Error fetching orders and updating driver:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/driver/:phone/orderList/:orderList", async (req, res) => {
  const nonZeroValues = {};
  let total = 0;
  let outputString = "";
  let orderList1 = [];

  const { phone, orderList } = req.params;

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
    console.log(`the item no ${key} has ${nonZeroValues[key]} quantity`);
    const foundItem = dataList.CLOTHES.find(
      (list) => list.ID === parseInt(key)
    );
    console.log(`Item with ID ${key} found:`, foundItem);
    if (foundItem) {
      total = total + foundItem.PRICE * nonZeroValues[key];
      try {
        orderList1.push({
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
  }

  try {
    const result = await Order.updateOne(
      { _id: orderList },
      {
        orders: orderList1,
      }
    );
    console.log(orderList1);
    return res.redirect(`/driver/${phone}/home`);
  } catch (error) {
    console.log("error");
    console.log(error);
  }
});

// ...

app.get("/test", (req, res) => {});
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
