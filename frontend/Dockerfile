# Stage 1 - install deps + build
# Use the official image as a parent image
FROM node:24.11.1

# Set the working directory
WORKDIR /usr/src/app

# Copy the file from your host to your current location
COPY package*.json ./

# Run the command inside your image filesystem
RUN npm install

# Copy the rest of your app's source code from your host to your image filesystem
# COPY frontend/ .
COPY . .

# Inform Docker that the container is listening on the specified port at runtime
EXPOSE 5173

# Run the specified command within the container
CMD ["npm", "run", "dev"]

#1 docker build -t alphagpt-frontend .
#2 docker network create mern    
#3 docker run --name=frontend --network=mern -d -p 5174:5174 alphagpt-frontend 
#4 docker logs frontend
#5 docker run --network=mern --name mongodb -d -p 27017:27017 -v ~/opt/data:/data/db mongo
#6 docker ps
#7 docker logs mongodb 
