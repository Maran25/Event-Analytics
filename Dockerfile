# Use Node.js as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build the app
RUN npm run build

# Ensure the dist folder exists and contains index.js
RUN ls dist || exit 1

# Expose the app's port
EXPOSE 3000

# Run the app
CMD ["node", "dist/src/index.js"]
