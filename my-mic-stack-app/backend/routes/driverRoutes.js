

const express = require('express');
const router = express.Router();




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

  
module.exports = router;
