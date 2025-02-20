# Stage 1: Build
FROM node:18 as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Build the Vite app
RUN npm run build

# Stage 2: Serve
FROM nginx:stable-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/

WORKDIR /usr/share/nginx/html

# Remove default Nginx static assets
# RUN rm -rf /usr/share/nginx/html/*

RUN rm -rf ./*

# Copy Vite build output to Nginx static directory
COPY --from=build /app/dist .

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
