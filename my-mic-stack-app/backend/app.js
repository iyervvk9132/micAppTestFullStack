const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const fs = require("fs").promises;
const { readFileSync } = require("fs");
const Nexmo = require("nexmo");
const DateTimeSlots = require('date-time-slots').default;
const axios = require('axios');
const { time } = require("console");


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
const pricelistdata=JSON.parse(readFileSync("./views/data.json"));
mongoose.connect("mongodb://localhost:27017/micTestApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  phone: String,
  isVerified: { type: Boolean, default: false },
  verificationCode: String,
  order: [
    {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    },
  ],
  address: {
    latitude: Number,
    longitude: Number,
    road: String,
    suburb:String,
    city:String,
    state:String,
    country: String,
    countryCode: String,
  },
});

const User = mongoose.model("customers", userSchema);

const orderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  orders: [
    {
      items: String,
      service: String,
      quantity: Number,
    },
  ],
  pickupDate: Date,
  deliveryDate: Date,
  pickupTime: String,
  deliveryTime: String,
  totalPrice:Number,
});

const Order = mongoose.model("Order", orderSchema);

const nexmo = new Nexmo({
  apiKey: "21c82be4",
  apiSecret: "9KykD98D0TWZ7JGb",
});

app.set("view engine", "ejs");

app.use(express.static("views"));

let orderList = [];
let pickupDate,pickupTime,deliveryDate,deliveryTime;
let result1;

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
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
            res.render("verify-otp", { phone });
          }
        }
      );
    } else {
      res.redirect("/register");
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});



app.get("/:phone/new-order", (req, res) => {
  console.log(req.params);
  console.log(req.session);

  res.redirect(`/${req.params.phone}/orderList`);
});


app.get("/:phone/orderList", (req, res) => {
  console.log(req.params);
  let today = new Date()
  let test = new Date()
  let time;
  console.log(today.getHours())
  if(today.getHours()>=16){
    today.setDate(today.getDate()+1);

  }
    day = today.getDate(),
    month = today.getMonth()+1, //January is 0
    year = today.getFullYear();
         if(day<10){
                day='0'+day
            } 
        if(month<10){
            month='0'+month
        }

        if (test.getDay()==today.getDate()) {
          time=today.getHours()+1;          
        }
        else{
          time=10;
        }
        today = year+'-'+month+'-'+day;
        console.log(time);
        time=time+":00"
  console.log(today)
  res.render("orderList", {
    data: data,
    subtotal: 0,
    phone: req.params.phone,
    currentDate: today,
    startTime:time,
  });
});


app.get("/:phone/pickup-delivery", (req, res) => {
  const { phone } = req.params;
  res.render("pickup-delivery", {  phone:req.params.phone });
});

app.post("/:phone/pickup-delivery", async (req, res) => {
  console.log("phone/pickup-delivery");
  const { pickupDate, deliveryDate } = req.body;
  console.log(result1._id);

  const timeSlots = DateTimeSlots.getSlots({
    startDate: new Date(pickupDateTime),
    endDate: new Date(deliveryDateTime),
    startTime: 10, 
    endTime: 18, 
    slotDuration: 1, 
  });

  console.log(timeSlots);
  console.log(result1._id);

  res.send(result1._id);
});



app.post("/:phone/orderList", async (req, res) => {
  const nonZeroValues = {};
  let total = 0;
  let outputString = "";
  orderList=[];
  

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
    if(key=="pickupDate"){
      pickupDate=nonZeroValues[key];
    }
    if(key=="pickupTime"){
      pickupTime=nonZeroValues[key];
    }
    if(key=="deliveryDate"){
      deliveryDate=nonZeroValues[key];
    }
    if(key=="deliveryTime"){
      deliveryTime=nonZeroValues[key];
    }


  }

  try {
    const user = await User.findOne({ phone: req.params.phone });

    if (user) {
      console.log(Date.parse(pickupDate))
      console.log(pickupTime)
      console.log(Date.parse(deliveryDate))
      console.log(deliveryTime)
       result1 = await Order.create({
        userId: req.session.userId,
        orders: orderList,
        pickupDate:Date.parse(pickupDate),
        pickupTime:pickupTime,
        deliveryDate:Date.parse(deliveryDate),
        deliveryTime:deliveryTime,
        totalPrice:total, 

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
        console.log(
          `Order updated successfully. Modified document ID: ${modifiedOrderId}`
        );

        return  res.send(result1);

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



app.get("/verify-otp", (req, res) => {
  res.render("verify-otp");
});


app.post("/verify-otp", async (req, res) => {
  const { phone, verificationCode } = req.body;

  try {
    const user = await User.findOne({ phone, verificationCode });

    if (user) {
      await User.updateOne({ phone }, { isVerified: true });
      res.redirect(`/${phone}/verify-address`);
    } else {
      res.status(401).send("Invalid verification code");
    }
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const phone = req.body.phone;
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
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
          res.redirect(`/${newUser.phone}/verify-otp`);
        }
      }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/:phone/verify-address", (req, res) => {
  res.render("verify-address", { phone: req.params.phone });
});

app.get("/:phone/history-orders", async (req, res) => {
  console.log(req.params);
  const user = await User.findOne({ phone: req.params.phone }).populate('order.orderId');
  if(user){
  

  res.render("historyOrders",{user:user});
  }
  else{
    res.send("user not found")
  }
});
app.post("/:phone/verify-address", async (req, res) => {
  const { phone } = req.params;
  const { latitude, longitude } = req.body;
  let road,suburb,city,state,country,countryCode;

  
  try {
      // const result2 = await nominatim.reverse({
      //   lat: parseFloat(latitude),
      //   lon: parseFloat(longitude),
      //   format: "json",
      // });
      // console.log(result2);
const customParams = 'format=json&zoom=18'; 
  
    console.log(req.body);
    
    
const apiUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&${customParams}`;  

    axios.get(apiUrl)
  .then(response => {
    // Handle the response data
    road=response.data.address.road
    console.log( 'road value:',road);    
    suburb=response.data.address.suburb;    
    city=response.data.address.city;    
    state=response.data.address.state;    
    country=response.data.address.country;
    countryCode=response.data.address.countryCode;
    handleAddressData(phone,latitude, longitude, road, suburb, city, state, country, countryCode,res);
    res.redirect(`/${phone}/user-data`);


  })
  .catch(error => {
    // Handle errors
    console.error('API Request Error:', error);
  });
  
  } catch (error) {
    console.error("Error saving location:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/:phone/user-saved-data",async (req,res)=>{
  const { phone } = req.params;
  const user = await User.findOne({ phone: req.params.phone }).populate('order.orderId');
  console.log(user);

  res.render('user-personal-data',{user})
}
)

app.get("/:phone/user-data", (req, res) => {
  const { phone } = req.params;
  res.render("user-data", { phone });
});
app.get("/:phone/pricelist", (req, res) => {
  console.log(dataList);
  res.render("pricelist",{data:dataList.CLOTHES});
});

async function  handleAddressData(phone,latitude, longitude, road, suburb, city, state, country, countryCode,res) {
  console.log( 'road value outside axios:',road);

    const result = await User.updateOne(
      { phone },
      { $set: { address: { latitude, longitude,road,suburb,city,state,country,countryCode } } }
    );
    console.log(result);
    console.log(latitude, longitude,road,suburb,city,state,country,countryCode);
    if (result.acknowledged ) {
      console.log("Location saved successfully.");
      
      console.log("result done");
      console.log(result);
      console.log(phone);
    } else {
      console.error("Failed to save location.");
      res.status(500).send("Failed to save location");
    }


}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

