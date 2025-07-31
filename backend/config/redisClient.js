const { createClient } = require('redis');

// Get the Redis URL from environment variables, with a fallback for local development without Docker.
// The URL 'redis://redis:6379' corresponds to the service name 'redis' in your docker-compose.yml file.
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('connect', () => {
    console.log('Connecting to Redis...');
});

redisClient.on('ready', () => {
    console.log('✅ Redis client connected successfully and ready to use.');
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('end', () => {
    console.log('Redis client disconnected.');
});

// Connect to Redis as soon as the application starts.
// The async IIFE (Immediately Invoked Function Expression) handles the promise.
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
})();

module.exports = redisClient;
