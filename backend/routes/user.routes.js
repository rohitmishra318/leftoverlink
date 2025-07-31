const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const UserController = require('../controllers/user.controller');
const authenticateToken = require('../middlewares/auth');
const { cacheUserData, cacheAllNgos } = require('../middlewares/cache'); // Import caching middlewares

// --- User Authentication ---
router.post('/signup', [
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long.'),
    body('fullname.firstname').isLength({ min: 1 }).withMessage('First name is required.'),
    body('fullname.lastname').isLength({ min: 1 }).withMessage('Last name is required.')
], UserController.registeruser);

router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('password').notEmpty().withMessage('Password is required.')
], UserController.loginuser);


// --- Donations (Protected & Cache-Invalidating) ---
router.post(
  "/donation",
  [
    body("donor").notEmpty().withMessage("Donor ID is required."),
    body("foodType").notEmpty().withMessage("Food is required."),
    body("quantity")
      .isFloat({ min: 0.1 })
      .withMessage("Quantity must be a positive number."),
    body("location").notEmpty().withMessage("Location is required."),
    body("expiry")
      .isISO8601()
      .withMessage("Please enter a valid expiry date."),
    body("manufactureDate")
      .isISO8601()
      .withMessage("Please enter a valid manufacture date."),
  ],
  UserController.addDonation
);

router.post('/accept', authenticateToken, UserController.acceptDonation);


// --- Profile & History Data (Protected & Cached) ---
router.get('/my-donations', authenticateToken, cacheUserData('my-donations'), UserController.getMyDonations);
router.get('/my-received', authenticateToken, cacheUserData('my-received'), UserController.getMyReceived);
router.get('/donationhistory', authenticateToken, cacheUserData('donation-history'), UserController.getDonationHistory);
router.get('/receivedhistory', authenticateToken, cacheUserData('received-history'), UserController.getReceivedHistory);
router.get('/donation-summary', authenticateToken, cacheUserData('donation-summary'), UserController.getdonatedgraph);
router.get('/received-summary', authenticateToken, cacheUserData('received-summary'), UserController.getreceivedgraph);


// --- NGOs & AI Suggestions ---
router.get('/ngos', cacheAllNgos, UserController.getAllNGOs); // Caches the full list of NGOs
router.post('/suggest-ngos', authenticateToken, UserController.getSuggestedNGOs); // Changed to POST to accept a body


module.exports = router;
