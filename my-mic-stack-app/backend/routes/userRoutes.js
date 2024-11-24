

const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middlewares/verifyToken'); // Example for using a middleware
const User = require('../models/userModel');
const nexmo = require('../middlewares/message');
const jwt = require("jsonwebtoken");
const Order = require('../models/orderModel');
const { readFileSync } = require('fs');

const secretKey = "iyer_vivek";

const dataList = JSON.parse(readFileSync("./models/PRICE_FINAL_DATA.json"));



/**
 * @route POST /user/login
 * @description Handles user login by sending a verification code via SMS.
 * @param {string} phone - The user's phone number.
 * @returns {Object} The response object or an error message.
 */
router.post("/login", async (req, res) => {
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
        "Yourrouter",
        phone,
        `Your verification code is: ${verificationCode}`,
        (err, responseData) => {
          if (err) {
            console.error(err);
            res.status(500).json({
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
 * @route POST /:phone/account-details
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
router.post("/:phone/account-details", verifyToken, async (req, res) => {
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
  
        res.status(200).json({
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
 * @route POST /:phone/details
 * @description Retrieves customer details based on the provided phone number.
 * @param {string} phone - The user's phone number.
 * @returns {Object} The user details or an error message.
 */
router.post("/:phone/details", async (req, res) => {
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
router.get("/verify-otp", (req, res) => {
    res.render("verify-otp", { phone, user: "user" });
  });
  
  /**
   * @route POST /:phone/verify-otp
   * @description Handles OTP verification and redirects based on user verification status.
   * @param {string} phone - The user's phone number.
   * @param {string} verificationCode - The OTP entered by the user.
   * @returns {Object} The response object or an error message.
   */
  router.post("/:phone/verify-otp", async (req, res) => {
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
          redirectUrl: `/${phone}/home`,
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
router.post("/verify-otp", async (req, res) => {
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
 * @route GET /:phone/new-order
 * @description Redirects users to the order list page for creating a new order.
 * @param {string} phone - The user's phone number.
 * @returns {Object} The redirected order list page.
 */

router.get("/:phone/new-order", (req, res) => {
  console.log(req.params);
  console.log(req.session);

  res.redirect(`/user/${req.params.phone}/orderList`);
});


/**
 * @route POST /user/:phone/orderList
 * @description Handles the creation of a new order based on user input.
 * @param {string} phone - The user's phone number.
 * @param {Object} req.body - The request body containing user-selected order details.
 * @returns {Object} The response object or an error message.
 */
router.post("/:phone/orderList", verifyToken, async (req, res) => {
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
      return res
        .status(400)
        .send("User address is not filled. Please update your address.");
    }const result1 = await Order.create({
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
      },
    });
  
    // Update the user document with the new order ID
    const result = await User.updateOne(
      { phone: req.params.phone },
      { $push: { order: { orderId: result1._id } } },
      { upsert: true }
    );
  
    console.log("Order created:", result1);
  
    if (result.acknowledged ) {
      // Redirect to the payment page or another relevant page
      console.log("success response sent")
      return res.status(200).send("order is successful");
    } 
  } catch (error) {
    console.log(pickupTime);
    console.error("Error saving orders to MongoDB:", error);
    return res.status(500).send("Internal Server Error");
  }
});
/**
 * @route GET /user/:phone/pricelist
 * @description Renders the price list page with available options for users.
 * @returns {Object} The rendered price list page.
 */
router.get("/:phone/pricelist", (req, res) => {
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
 * @route GET /:phone/history-orders
 * @description Renders the user's order history page.
 * @param {string} phone - The user's phone number.
 * @returns {Object} The rendered order history page for users.
 */
router.get("/:phone/history-orders", verifyToken, async (req, res) => {
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
router.post("/:phone/updateAddress", verifyToken, async (req, res) => {
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
    userLandmark,
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



module.exports = router;
