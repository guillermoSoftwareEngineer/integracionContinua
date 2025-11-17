# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the project
RUN npm run build

# Test stage
FROM node:20-alpine as test

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Run tests
RUN npm run test -- --run

# Production stage
FROM nginx:alpine

# Install bash and envsubst
RUN apk add --no-cache bash

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy env setup script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create env.js template
RUN echo "window.ENV = { API_URL: '$VITE_API_URL', SECRET_KEY: '$VITE_SECRET_KEY' };" > /usr/share/nginx/html/env.template.js

# Expose port
EXPOSE 80

# Set entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]