// backend/controllers/donationController.js

const axios = require('axios'); // Make sure you have axios installed: npm install axios

// Assuming your Python AI model API is running on port 5001
const AI_MODEL_API_URL = 'http://localhost:5001/suggest-ngos';

// Controller to handle getting NGO suggestions
exports.getNgoSuggestions = async (req, res) => {
    try {
        // The frontend sends these as query parameters in your original code,
        // but for a POST request (which the Python API expects), we'll use body.
        // Let's assume frontend will send as body for consistency.
        const { location, foodType, quantity, expiry } = req.body; // Changed from req.query to req.body

        // Basic validation
        if (!location || !foodType || !quantity || !expiry) {
            return res.status(400).json({ error: "Missing required donation details for suggestions." });
        }

        // Prepare data for the Python AI model
        const donationDataForAI = {
            donor_address: location, // Python model expects 'donor_address'
            food_type: foodType,
            quantity: parseInt(quantity), // Ensure quantity is a number
            expiry_date: expiry // Python model expects 'YYYY-MM-DD' format
        };

        // Call the Python AI model API
        console.log("Sending data to AI model:", donationDataForAI);
        const aiResponse = await axios.post(AI_MODEL_API_URL, donationDataForAI);
        const suggestedNGOs = aiResponse.data; // This will be the list of suggested NGOs
        console.log("NGOs suggested by AI model:", suggestedNGOs);
        // Send the suggestions back to the React frontend
        res.status(200).json({ ngos: suggestedNGOs });

    } catch (error) {
        console.error("Error getting NGO suggestions:", error.message);
        if (error.response && error.response.data) {
            // Forward error from AI model if available
            return res.status(error.response.status || 500).json({ error: error.response.data.error || "Failed to get NGO suggestions from AI model." });
        }
        res.status(500).json({ error: "Server error while fetching suggestions." });
    }
};

// Your existing createDonation controller (if you have one, keep it as is, or modify if needed)
exports.createDonation = async (req, res) => {
    // ... (your existing donation submission logic)
    // This part is separate from the suggestion logic.
    // If you want to integrate the AI model here too, you can call axios.post(AI_MODEL_API_URL, ...)
    // after saving the donation, and then store/use the suggestions.
    try {
        // Example of how you might use the AI model after saving a donation:
        // const { donor, location, quantity, foodType, expiry, manufactureDate } = req.body;
        // ... save donation to DB ...

        // Optionally, get suggestions after saving (if you want to notify NGOs immediately)
        // const donationDataForAI = {
        //     donor_address: location,
        //     food_type: foodType,
        //     quantity: parseInt(quantity),
        //     expiry_date: expiry
        // };
        // const aiResponse = await axios.post(AI_MODEL_API_URL, donationDataForAI);
        // const suggestedNGOs = aiResponse.data;
        // console.log("NGOs suggested after donation submission:", suggestedNGOs);

        // ... send socket.emit ...
        // res.status(200).json({ message: "Donation added successfully!", suggestedNGOs });

    } catch (err) {
        // ... error handling ...
    }
};