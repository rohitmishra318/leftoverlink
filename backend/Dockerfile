# 1. Use an official Node.js runtime as the base image.
# 'alpine' is a lightweight version, which is great for production.
FROM node:18-alpine

# 2. Set the working directory inside the container.
# All subsequent commands (like COPY, RUN) will happen here.
WORKDIR /app

# 3. Copy package.json and package-lock.json.
# We copy these first to take advantage of Docker's caching.
# If these files don't change, Docker won't reinstall dependencies on every build.
COPY package*.json ./

# 4. Install the project dependencies defined in your package.json.
RUN npm install

# 5. Copy the rest of your application's source code into the container.
# This includes your server.js, and the routes, controllers, models directories.
COPY . .

# 6. Expose the port your Node.js app listens on.
# Change '3000' if your app uses a different port.
EXPOSE 3000

# 7. Define the command to run your application.
# This command executes your main 'server.js' file using Node.
CMD [ "node", "server.js" ]
