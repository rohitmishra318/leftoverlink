const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require("jsonwebtoken");

const UserModel = require('../models/user.model');
const userService = require('../services/user.services');
const FoodModel = require('../models/foodmodel');
const Receive = require('../models/Receive');
const Ngo = require('../models/ngos');

// Register a new user
module.exports.registeruser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password } = req.body;

  try {
    const hashedPassword = await UserModel.hashPassword(password);
    const user = await userService.createUser({
      fullname: {
        firstname: fullname.firstname,
        lastname: fullname.lastname
      },
      email,
      password: hashedPassword
    });

    const token = user.generateAuthToken();
    res.status(201).json({ token, user });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
module.exports.loginuser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = user.generateAuthToken();
    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add donation
module.exports.addDonation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { foodType, quantity, description, expiry, location, donor } = req.body;

  try {
    const food = new FoodModel({
      donor,
      foodType,
      quantity,
      description,
      expiry,
      location
    });

    await food.save();
    res.status(201).json({ message: 'Donation added successfully', food });
  } catch (error) {
    console.error("Add donation error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get my donations
module.exports.getMyDonations = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id;

    const donations = await FoodModel.find({ donor: userId });
    res.status(200).json({ donations });
  } catch (error) {
    console.error("Get my donations error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Accept donation
module.exports.acceptDonation = async (req, res) => {
  const { donor, quantity, foodtype, location, expiry, receiver } = req.body;

  try {
    const food = await FoodModel.findOne({
      donor,
      quantity,
      foodType: foodtype,
      location,
      expiry
    });

    if (!food) return res.status(404).json({ message: "Food not found" });

    if (food.status !== "available") {
      return res.status(400).json({ message: "Food already claimed or expired" });
    }

    food.status = "claimed";
    await food.save();

    const record = new Receive({
      food: food._id,
      donatedBy: donor,
      receivedBy: receiver,
    });

    await record.save();

    // 🔥 Emit socket event to the donor
    const io = req.app.get("io"); // You should have stored it in app.locals or similar
    io.to(donor).emit("donation-accepted", {
      receiverId: receiver,
      foodType: foodtype,
      quantity,
      location,
    });

    res.status(200).json({ message: "Donation accepted successfully", record });
  } catch (err) {
    console.error("Accept donation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Get donations received by the user
module.exports.getMyReceived = async (req, res) => {
  try {
    const userId = req.user._id;
    const received = await Receive.find({ receivedBy: userId });
    res.status(200).json({ totalReceived: received.length });
  } catch (err) {
    console.error("Get my received error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all NGOs
module.exports.getAllNGOs = async (req, res) => {
  try {
    const ngos = await Ngo.find().select('name email location lat lng phone address');
    res.status(200).json({ ngos });
  } catch (err) {
    console.error("Error fetching NGOs:", err);
    res.status(500).json({ message: "Server error" });
  }
};
