# Multi-stage build for optimized production image
# Stage 1: Development
FROM node:18-alpine as development

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ gcc sqlite-dev

# Copy package files
COPY package*.json ./

# Install dev dependencies only first
RUN npm install --only=development

# Install all dependencies and rebuild SQLite3
RUN npm install --build-from-source=better-sqlite3

# Copy application code
COPY . .

# Create data directory for SQLite
RUN mkdir -p /app/data

# Stage 2: Production
FROM node:18-alpine AS production

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ gcc sqlite-dev

# Copy package files
COPY package*.json ./

# Install only production dependencies and rebuild SQLite3
RUN npm ci --only=production --build-from-source=better-sqlite3

# Copy application code
COPY . .

# Create data directory for SQLite
RUN mkdir -p /app/data

# Remove build dependencies to reduce image size
RUN apk del python3 make g++ gcc sqlite-dev

# Set NODE_ENV
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/spendr.db
ENV MOVEMENTS_CLEAR_SECRET=IDSOFTWARE123456

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]