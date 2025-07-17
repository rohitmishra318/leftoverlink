const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const UserController = require('../controllers/user.controller');
const authenticateToken = require('../middlewares/auth');

router.post('/signup', [
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('password').isLength({min: 5}).withMessage('Password must be at least 5 characters long.'),
    body('fullname.firstname').isLength({min: 1}).withMessage('First name is required.'),
    body('fullname.lastname').isLength({min: 1}).withMessage('Last name is required.')
],UserController.registeruser);


router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('password').notEmpty().withMessage('Password is required.')
], UserController.loginuser)


router.post('/donation',[
    body('donor').notEmpty().withMessage('Donor ID is required.'),
    body('foodType').notEmpty().withMessage('Food is required.'),
    body('quantity').isInt({min: 1}).withMessage('Quantity must be a positive integer.'),
    body('location').notEmpty().withMessage('Location is required.'),
    body('expiry').isISO8601().toDate().withMessage('Please enter a valid date.'),
    body('manufactureDate').isISO8601().toDate().withMessage('Please enter a valid date.'),
    
    
], UserController.addDonation);

router.get('/my-donations',UserController.getMyDonations);


router.post('/accept',authenticateToken , UserController.acceptDonation);

// In routes/user.routes.js
router.get('/my-received', authenticateToken, UserController.getMyReceived);

router.get('/donationhistory', authenticateToken, UserController.getDonationHistory);
router.get('/receivedhistory', authenticateToken, UserController.getReceivedHistory);




router.get('/ngos', UserController.getAllNGOs);

router.get('/received-summary', authenticateToken, UserController.getreceivedgraph);

router.get('/donation-summary', authenticateToken, UserController.getdonatedgraph);


router.get('/suggest-ngos', UserController.getSuggestedNGOs);

module.exports = router;


