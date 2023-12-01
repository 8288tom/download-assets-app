# Build the React application
FROM node:14 as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Install 'serve' to serve the static files
RUN npm install -g serve

# Serve the application on port 80
CMD serve -s build -l 80
