# Use a node image as base
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Set environment variables
ENV PATH="/app/node_modules/.bin:$PATH"
ENV NODE_ENV=production
ENV US_IDM_PATH="/idomoo-grid/projects/" 
ENV US_ASSET_PATH="/idomoo-grid/public_assets/"  
ENV EU_HOST=""
ENV EU_ASSET_PATH="/idomoo-grid/public_assets/"
ENV EU_IDM_PATH="/idomoo-grid/projects/"
ENV EFS_MOUNT_POINT="/idomoo-grid/public_assets/"
ENV PORT=5069
# Expose the port the app runs on
EXPOSE 5069

# Run your application
CMD ["npm", "start"]
