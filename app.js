require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { models } = require("mongoose");
const auth = require('./middleware/auth');
const cors = require('cors');

const app = express();
app.use(express.json( { limit: "50mb" }));

app.use(cors());

// Importing user context
const User = require("./model/user");

// Register route

app.post("/register", async (req, res) => {
  //Register logic
  try {
    //Get user input
    const { username, email, password } = req.body;

    //Validate user input
    if (!(username && email && password)) {
      res.status(400).send(" All input are required ");
    }

    //Check if user already exists
    //Validate if user exist in our database
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      res.status(409).send(" User already exists");
    }

    // Encrypt user password
    encryptedUserPassword = await bcrypt.hash(password, 10);

    //Create user in databasa
    const user = await User.create({
      username: username,
      email: email.toLowerCase(),
      password: encryptedUserPassword,
    });

    //Create token
    const token = jwt.sign(
      {
        user_id: user._id,
        email,
      },
      process.env.TOKEN_KEY,
      {
        expiresIn: "5h",
      }
    );

    //Save token
    user.token = token;

    //Return new user
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
  }
});

//Getting all registered users

app.get("/register", async (req, res) => {
  User.find({}).then((results) => {
    res.send(results);
  });
});

app.post("/login", async (req, res) => {
  //Login logic
  try {
    //Get user input
    const { email, password } = req.body;

    //Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    // Validate if user exists in the database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      //Create token

      const token = jwt.sign(
        {
          user_id: user._id,
          email,
        },
        process.env.TOKEN_KEY,
        {
          expiresIn: "5h",
        }
      );

      //Save user token
      user.token = token;

      // user
      return res.status(200).json(user);
    }
    return res.status(400).send("Invalid user");
  } catch (error) {
    console.log(error);
  }
});


app.get('/welcome',auth, (req,res)=>{
  return res.status(200).send('Welcome');
});

module.exports = app;
