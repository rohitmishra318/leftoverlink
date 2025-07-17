// backend/routes/donationRoutes.js

const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationcontroller');

// Route to create a donation (your existing route)
router.post('/donations', donationController.createDonation);

// NEW ROUTE for getting NGO suggestions
router.post('/suggestions', donationController.getNgoSuggestions); // Changed from /users/suggest-ngos to /suggestions for clarity

module.exports = router;