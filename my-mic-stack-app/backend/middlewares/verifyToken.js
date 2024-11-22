const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Adjust the path based on your project structure
const secretKey = "iyer_vivek";

const verifyToken = async (req, res, next) => {
  console.log("verifying tokens start...")
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


const verifyDriverToken = async (req, res, next) => {
  console.log("req:", req.headers); // Log headers for debugging
  const token = req.headers['authorization']?.replace("Bearer ", ""); // Use optional chaining
console.log(token);
  // Check if token is undefined
  if (!token) {
    console.error("error undefined token")
      return res.status(401).send({ error: "Authentication required. Token not found." });
  }

  try {
      const decoded = jwt.verify(token, secretKey);
      const driver = await Driver.findOne({
          _id: decoded._id,
          "tokens.token": token,
      });

      if (!driver) {
          throw new Error();
      }

      req.driver = driver;
      req.token = token;
      next();
  } catch (error) {
      res.status(401).send({ error: "Please authenticate as a driver." });
  }
};

module.exports = {verifyToken,verifyDriverToken};
