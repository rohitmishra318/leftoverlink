# --- Stage 1: Build the React/Vue/Svelte App ---
# Use a Node.js image to build the static files.
FROM node:18-alpine AS build

# Set the working directory inside the container.
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache.
COPY package*.json ./

# Install all dependencies.
RUN npm install

# Copy the rest of your source code.
COPY . .

# Run the build script from your package.json (e.g., 'vite build').
RUN npm run build

# --- Stage 2: Serve the App with Nginx ---
# Use a lightweight Nginx image to serve the static files.
FROM nginx:stable-alpine

# Copy the built assets from the 'build' stage to the Nginx public directory.
# Vite builds to a 'dist' folder by default.
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration.
# This is crucial for Single Page Applications (SPAs) to handle routing correctly.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80, which is the default port for Nginx.
EXPOSE 80

# The Nginx base image automatically starts the server.
# No CMD is needed.
