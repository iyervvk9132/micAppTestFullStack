

const express = require('express');
const router = express.Router();

const Order = require('../models/orderModel');
const Driver = require('../models/driverModel.js');
const nexmo = require('../middlewares/message');
const  jwt  = require('jsonwebtoken');
const { verifyDriverToken } = require('../middlewares/verifyToken');
const Razorpay = require("razorpay"); 
const secretKey = "iyer_vivek";


const razorpay = new Razorpay({
  key_id: "rzp_test_hz7exB8EYQbPhc",
  key_secret: "i2LIhe1AicXd8VidEuFapAYU",
});

router.post("/:phone/order/:orderId/generateQr", async (req, res) => {
  try {
    const {orderId,phone}=req.params;
    console.log("Received request to generate QR code for order:", orderId);
    const order = await Order.findById(orderId).populate("userId");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    console.log(order);


    const orderDetails = {
      type: "upi_qr",
  name: "MIC STORE",
  usage: "single_use",
  fixed_amount: true,
  payment_amount: order.totalPrice*100,
  customer_id: order.userId.razorpayCustomerId,
  notes: {
    purpose: "Test UPI QR Code notes"
  }

    };

    const startTime = Date.now();
    const razorpayOrder = await razorpay.qrCode.create(orderDetails);
    console.log("Razorpay Order created in:", razorpayOrder);

    const qrCodeUrl = razorpayOrder.image_url; // Replace with your QR code logic
    res.status(200).json({ qrUrl: qrCodeUrl });
  } catch (error) {
    console.error("Error generating Razorpay QR code:", error);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

/**
 * @route POST /driver/login
 * @description Handles driver login by sending a verification code via SMS.
 * @param {string} phone - The driver's phone number.
 * @returns {Object} The response object or an error message.
 */
router.post("/login", async (req, res) => {
    const phone = req.body.phone;
    console.log("driver/login");
    console.log(req.body);
    const newphone = phone.substring(1); // Remove leading '+' if present
    console.log(newphone);
  
    try {
      const driver = await Driver.findOne({ phone: newphone, isVerified: true });
      console.log("Driver found:", driver);
  
      if (driver) {
        const verificationCode = Math.floor(
          100000 + Math.random() * 900000
        ).toString();
  
        await Driver.updateOne({ phone: newphone }, { verificationCode });
  
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
                message: "Driver found and verification code sent successfully",
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
 * @route POST /driver/:phone/verify-otp
 * @description Handles OTP verification for drivers.
 * @param {string} phone - The driver's phone number.
 * @param {Object} req.body - The request body containing the verification code.
 * @returns {Object} Redirects to the driver's home page or displays an error message.
 */
router.post("/:phone/verify-otp", async (req, res) => {
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
      // Generate JWT token

      const token = jwt.sign(
        { _id: driver._id.toString(), phone: driver.phone },

        secretKey
      );

      // Store the token in the database

      driver.tokens = driver.tokens.concat({ token });
      await driver.save();
      res.json({
        message: "Verification successful",
        token,
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
 * @route POST /:phone/driver-pickup1
 * @description Assigns a driver to an order for pickup.
 * @param {string} phone - The phone number of the driver.
 * @body {string} order - The ID of the order to be picked up.
 */
router.post("/:phone/driver-pickup1", verifyDriverToken,  async (req, res) => {
  const { phone } = req.params; // Extract driver phone number from URL
  const { order } = req.body; // Extract order ID from request body

  try {
    // Find the order by ID
    const orderData = await Order.findById(order);
    if (!orderData) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Find the driver by phone number
    const driverData = await Driver.findOne({ phone });
    if (!driverData) {
      return res.status(404).json({ error: "Driver not found" });
    }

    // Update the order with pickupDriverId
    orderData.pickupDriverId = driverData._id;
    orderData.isDriverConfirmed = true; // Set driver confirmation
    await orderData.save();

    // Update the driver with the order in pickupOrder array
    driverData.pickupOrder.push({
      orderId: orderData._id,
    });
    await driverData.save();

    res.json({ message: "Driver pickup confirmed and order updated" });
  } catch (error) {
    console.error("Error updating order and driver:", error);
    res.status(500).json({ error: "Server error" });
  }
});


/**
 * @route GET /:phone/order/:orderId
 * @description Fetches a specific order for a driver.
 * @param {string} phone - The phone number of the driver.
 * @param {string} orderId - The ID of the order to be fetched.
 */
router.get("/:phone/order/:orderId", verifyDriverToken,  async (req, res) => {
  const { phone, orderId } = req.params;

  try {
    // Find the driver using the phone number
    const driver = await Driver.findOne({ phone });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Find the order using the orderId and confirm the driver is assigned to it
    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found or not assigned to this driver" });
    }

    // Respond with the order details
    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


/**
 * @route POST /:phone/order/:orderId/reached-location
 * @description Updates the order to indicate the driver reached the location.
 * @param {string} phone - The phone number of the driver.
 * @param {string} orderId - The ID of the order to be updated.
 */
router.post("/:phone/order/:orderId/reached-location", verifyDriverToken,  async (req, res) => {
  const { phone, orderId } = req.params;

  try {
    // Find the order by orderId
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
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

    return res
      .status(200)
      .json({ message: "Order status updated to reached location", order });
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route POST /:phone/orders/:orderId
 * @description Updates an existing order with new items, total price, payment status, and Razorpay order ID. Marks the order as picked up.
 * @param {string} phone - The phone number of the driver.
 * @param {string} orderId - The ID of the order to be updated.
 * @body {Array} orders - Array of items to update in the order.
 * @body {number} totalPrice - The updated total price of the order.
 * @body {boolean} isPaid - The payment status of the order.
 * @body {string} razorpayOrderId - The Razorpay order ID associated with the payment.
 */

router.post("/:phone/orders/:orderId", verifyDriverToken,  async (req, res) => {
  const { phone, orderId } = req.params;
  const { orders, totalPrice, isPaid, razorpayOrderId } = req.body;
  console.log("req.body", req.body);

  try {
    // Find the driver by phone number
    const driver = await Driver.findOne({ phone });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the orders array by appending new items
    order.orders = orders;
    console.log("Razorpay:",razorpayOrderId)

    // Update the total price
    order.totalPrice = totalPrice;
    order.isPickedUp = true;
    order.isPaid = isPaid;
    order.payment.razorpayOrderId = razorpayOrderId;
    console.log("order:".order);

    // Save the updated order
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
 * @route POST /driver/:phone/history-orders
 * @description Handles post requests for the history of orders page for drivers, without considering driver ID.
 * @param {Object} req.body - The request body.
 * @param {string} phone - The driver's phone number.
 */
router.get("/:phone/history-orders", verifyDriverToken, async (req, res) => {
  console.log("started");
  try {
    // const { phone } = req.params;
    // console.log("phone");
    // console.log(phone);

    // Fetch all orders associated with this phone number
    const orders = await Order.find().populate("userId");
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
 * @route POST /:phone/driver-delivery1
 * @description Assigns a driver to an order for delivery and updates the order and driver's delivery list.
 * @param {string} phone - The phone number of the driver.
 * @body {string} order - The ID of the order to be delivered.
 */
router.post("/:phone/driver-delivery1", verifyDriverToken,  async (req, res) => {
  const { phone } = req.params; // Extract driver phone number from URL
  const { order } = req.body; // Extract order ID from request body

  try {
    // Find the order by ID
    const orderData = await Order.findById(order);
    if (!orderData) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Find the driver by phone number
    const driverData = await Driver.findOne({ phone });
    if (!driverData) {
      return res.status(404).json({ error: "Driver not found" });
    }

    // Update the order with deliveryDriverId
    orderData.deliveryDriverId = driverData._id;
    orderData.isDeliveryPickuped = true; // Set driver confirmation
    await orderData.save();

    // Update the driver with the order in pickupOrder array
    driverData.deliveryOrder.push({
      orderId: orderData._id,
      date: new Date(), // Add current date for the pickup order
    });
    await driverData.save();

    res.json({ message: "Driver pickup confirmed and order updated" });
  } catch (error) {
    console.error("Error updating order and driver:", error);
    res.status(500).json({ error: "Server error" });
  }
});



/**
 * @route POST /:phone/order/:orderId/complete-delivery
 * @description Marks an order as completed.
 * @param {string} phone - The phone number of the driver.
 * @param {string} orderId - The ID of the order to be marked as completed.
 */
router.post("/:phone/order/:orderId/complete-delivery", verifyDriverToken, async (req, res) => {
  const { phone, orderId } = req.params;
  console.log("complete-delivery",req.params);

  try {
    // Find the order by orderId
    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      return res.status(404).send("Order not found");
    }

    // Verify that the driver exists and is verified
    const driver = await Driver.findOne({ phone, isVerified: true });

    if (!driver) {
      return res.status(404).send("Driver not found or not verified");
    }

    const completedOrder = {
      orderId: order._id,
      date: new Date(),
    };

    // Add completedOrder to the driver's completedOrders array
    await Driver.updateOne({ phone }, { $push: { completedOrders: completedOrder } });

    // Update the order status to completed
    await Order.updateOne(
      { _id: orderId },
      { $set: { isDelivered: true, deliveryCompletedAt: new Date() } }
    );

    return res.status(200).send("Delivery completed successfully");
  } catch (error) {
    console.error("Error updating order for delivery completion:", error);
    res.status(500).send("Internal Server Error");
  }
});


/**
 * @route GET /:phone/order/:orderId/payment-status
 * @description Retrieves the payment status of a specific order for a driver.
 * @param {string} phone - The phone number of the driver.
 * @param {string} orderId - The ID of the order whose payment status is to be checked.
 */
router.get("/:phone/order/:orderId/payment-status", verifyDriverToken, async (req, res) => {
  const { phone, orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const driver = await Driver.findOne({ phone, isVerified: true });
    if (!driver) return res.status(404).json({ message: "Driver not found or not verified" });

    return res.status(200).json({ 
      orderId: order._id, 
      isPaid: order.isPaid,
      message: "Payment status retrieved successfully" 
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


module.exports = router;
