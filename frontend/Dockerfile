
# Use Node.js 18 as the base image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY frontend/ .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]