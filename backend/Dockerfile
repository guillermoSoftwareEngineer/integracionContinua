# Single-stage build for CI (development)
FROM node:18-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ gcc sqlite-dev

# Copy package files
COPY package*.json ./

# Install ALL dependencies (incl. dev) and rebuild SQLite3
RUN npm ci --build-from-source=better-sqlite3

# Copy application code
COPY . .

# Create data directory for SQLite
RUN mkdir -p /app/data

ENV NODE_ENV=test
ENV PORT=3000
ENV DB_PATH=/app/data/spendr.db
ENV MOVEMENTS_CLEAR_SECRET=IDSOFTWARE123456

EXPOSE 3000

CMD ["npm", "start"]