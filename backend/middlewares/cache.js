const redisClient = require('../config/redisClient'); // Make sure you have this file to connect to Redis

/**
 * A higher-order function that creates a caching middleware.
 * It uses a prefix to create a unique, user-specific cache key.
 * @param {string} prefix - The prefix for the cache key (e.g., 'my-donations').
 */
const cacheUserData = (prefix) => async (req, res, next) => {
  // The authenticateToken middleware should add the user object to the request.
  // If the user isn't authenticated, we can't cache, so we skip to the next function.
  if (!req.user || !req.user._id) {
    console.error("User not authenticated for caching. Skipping cache.");
    return next();
  }

  const userId = req.user._id;
  const cacheKey = `${prefix}:${userId}`;

  try {
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      // CACHE HIT: Data found in Redis.
      console.log(`CACHE HIT for ${cacheKey}`);
      // Send the cached data and end the request-response cycle.
      return res.status(200).json(JSON.parse(cachedData));
    } else {
      // CACHE MISS: No data in Redis.
      console.log(`CACHE MISS for ${cacheKey}`);
      // Store the key in res.locals so the controller can use it to set the cache later.
      res.locals.cacheKey = cacheKey;
      // Proceed to the controller function to fetch data from the database.
      return next();
    }
  } catch (error) {
    console.error('Redis error:', error);
    // If Redis has an error, we don't want the app to crash.
    // We just proceed to fetch from the database as a fallback.
    return next();
  }
};

// We can keep the NGO cache logic here as well if needed
const cacheAllNgos = async (req, res, next) => {
    // ... your existing cacheAllNgos logic
};


module.exports = { cacheUserData, cacheAllNgos };
