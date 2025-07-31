const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const jwt = require("jsonwebtoken");
const axios = require('axios'); // Needed for getSuggestedNGOs

// Import your models
const UserModel = require('../models/user.model');
const FoodModel = require('../models/foodmodel');
const Receive = require('../models/Receive');
const Ngo = require('../models/ngos');

// Import the Redis client
const redisClient = require('../config/redisClient');


// --- AUTHENTICATION (No Caching Needed) ---

module.exports.registeruser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password } = req.body;

    try {
        const hashedPassword = await UserModel.hashPassword(password);
        // Assuming createUser is a static method on your model or a service function
        const user = await UserModel.create({
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


// --- CACHE INVALIDATION LOGIC ---

module.exports.addDonation = async (req, res) => {
    console.log("Adding donation:", req.body);

    // Step 1: Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Step 2: Extract donor from body (instead of middleware)
    const { donor, foodType, quantity, description, expiry, location } = req.body;

    if (!donor) {
        return res.status(400).json({ message: 'Bad request: donor ID is missing' });
    }

    try {
        // Step 3: Create and save new donation
        const food = new FoodModel({
            donor,
            foodType,
            quantity,
            description,
            expiry,
            location
        });

        console.log("Food donation object:", food);
        await food.save();

        // Step 4: Invalidate relevant Redis cache keys
        const keysToDel = [
            `my-donations:${donor}`,
            `donation-summary:${donor}`,
            `donation-history:${donor}`
        ];

        try {
            await redisClient.del(...keysToDel);
            console.log(`✅ CACHE INVALIDATED for user ${donor}: ${keysToDel.join(', ')}`);
        } catch (redisErr) {
            console.warn("⚠️ Redis error while invalidating cache:", redisErr.message);
        }

        // Step 5: Return success
        return res.status(201).json({ message: 'Donation added successfully', food });
    } catch (error) {
        console.error("❌ Add donation error:", error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports.acceptDonation = async (req, res) => {
    const { donor, quantity, foodtype, location, expiry } = req.body;
    const receiver = req.user._id;

    try {
        const food = await FoodModel.findOne({ donor, quantity, foodType: foodtype, location, expiry });
        if (!food) return res.status(404).json({ message: "Food not found" });
        if (food.status !== "available") return res.status(400).json({ message: "Food already claimed or expired" });

        food.status = "claimed";
        await food.save();

        const record = new Receive({ food: food._id, donatedBy: donor, receivedBy: receiver });
        await record.save();

        // --- Redis Invalidation for BOTH users ---
        const keysToDel = [
            `my-donations:${donor}`, `donation-summary:${donor}`, `donation-history:${donor}`,
            `my-received:${receiver}`, `received-summary:${receiver}`, `received-history:${receiver}`
        ];
        await redisClient.del(keysToDel);
        console.log(`CACHE INVALIDATED: ${keysToDel.join(', ')}`);
        // --- End Redis Invalidation ---

        const io = req.app.get("io");
        io.to(donor).emit("donation-accepted", { receiverId: receiver, foodType: foodtype, quantity, location });

        res.status(200).json({ message: "Donation accepted successfully", record });
    } catch (err) {
        console.error("Accept donation error:", err);
        res.status(500).json({ message: "Server error" });
    }
};


// --- PROFILE & HISTORY DATA (with Caching) ---

module.exports.getMyDonations = async (req, res) => {

    console.log("fetching ghijrhiojrtghiojrthiojhiorthjriohjhiojrhiojhiorhjhiortjrthiorhjriohjthiohjiorhjrhiotjhiorhjrhiojrhiorhjriohjrhiorhjriohjrioh");
    try {
        const userId = req.user._id;
        const donations = await FoodModel.find({ donor: userId });
        const responseData = { donations };

        const { cacheKey } = res.locals;
        if (cacheKey) {
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));
        }
        res.status(200).json(responseData);
    } catch (error) {
        console.error("Get my donations error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports.getMyReceived = async (req, res) => {
    try {
        const userId = req.user._id;
        const received = await Receive.find({ receivedBy: userId });
        const responseData = { totalReceived: received.length };

        const { cacheKey } = res.locals;
        if (cacheKey) {
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));
        }
        res.status(200).json(responseData);
    } catch (err) {
        console.error("Get my received error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports.getdonatedgraph = async (req, res) => {
    try {
        const userId = req.user._id;
        const donated = await Receive.aggregate([
            { $match: { donatedBy: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: "$receivedBy", count: { $sum: 1 } } },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "receiverInfo" } },
            { $unwind: "$receiverInfo" },
            { $project: { _id: 0, user: "$receiverInfo._id", name: { $concat: ["$receiverInfo.fullname.firstname", " ", "$receiverInfo.fullname.lastname"] }, count: 1 } }
        ]);
        
        const { cacheKey } = res.locals;
        if (cacheKey) {
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(donated));
        }
        res.status(200).json(donated);
    } catch (err) {
        console.error("Error fetching donated graph data:", err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports.getreceivedgraph = async (req, res) => {
    try {
        const userId = req.user._id;
        const received = await Receive.aggregate([
            { $match: { receivedBy: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: "$donatedBy", count: { $sum: 1 } } },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "donorInfo" } },
            { $unwind: "$donorInfo" },
            { $project: { _id: 0, user: "$donorInfo._id", name: { $concat: ["$donorInfo.fullname.firstname", " ", "$donorInfo.fullname.lastname"] }, count: 1 } }
        ]);

        const { cacheKey } = res.locals;
        if (cacheKey) {
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(received));
        }
        res.status(200).json(received);
    } catch (err) {
        console.error("Error fetching received graph data:", err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports.getDonationHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const donations = await Receive.find({ donatedBy: userId })
            .populate({ path: 'food', select: 'foodType quantity expiry location' })
            .populate({ path: 'receivedBy', select: 'fullname email' });

        const responseData = { donations };
        const { cacheKey } = res.locals;
        if (cacheKey) {
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));
        }
        res.status(200).json(responseData);
    } catch (err) {
        console.error("Error fetching donation history:", err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports.getReceivedHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const received = await Receive.find({ receivedBy: userId })
            .populate({ path: 'food', select: 'foodType quantity expiry location' })
            .populate({ path: 'donatedBy', select: 'fullname email' });

        const responseData = { received };
        const { cacheKey } = res.locals;
        if (cacheKey) {
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));
        }
        res.status(200).json(responseData);
    } catch (err) {
        console.error("Error fetching received history:", err);
        res.status(500).json({ message: "Server error" });
    }
};


// --- NGO & AI FUNCTIONS (Caching for NGOs, not for AI suggestions) ---

module.exports.getAllNGOs = async (req, res) => {
    try {
        const ngos = await Ngo.find().select('name email location lat lng phone address');
        
        const { cacheKey } = res.locals;
        if (cacheKey) {
            await redisClient.setEx(cacheKey, 3600, JSON.stringify({ ngos }));
        }
        res.status(200).json({ ngos });
    } catch (err) {
        console.error("Error fetching NGOs:", err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports.getSuggestedNGOs = async (req, res) => {
    const { location, foodType, quantity, expiryDate } = req.body;
    if (!location || !foodType || !quantity) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    try {
        const aiResponse = await axios.post("http://ai-service:5000/api/predict-suggestions", {
            location, foodType, quantity, expiryDate
        });
        const ngoNames = aiResponse.data.suggestedNgos;
        const ngos = await Ngo.find({ name: { $in: ngoNames } });
        res.json({ ngos });
    } catch (err) {
        console.error("AI suggestion error:", err.message);
        res.status(500).json({ message: "AI suggestion failed" });
    }
};
