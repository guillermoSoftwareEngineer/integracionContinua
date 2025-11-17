# Single-stage build for CI (test-ready)
FROM node:18-alpine

WORKDIR /app

# native deps for better-sqlite3
RUN apk add --no-cache python3 make g++ gcc sqlite-dev

# copy manifests
COPY package*.json ./

# install EVERYTHING (incl. jest) and rebuild sqlite
RUN npm ci --build-from-source=better-sqlite3

# copy source
COPY . .

# data folder
RUN mkdir -p /app/data

# test env
ENV NODE_ENV=test
ENV PORT=3000
ENV DB_PATH=/app/data/spendr.db
ENV MOVEMENTS_CLEAR_SECRET=IDSOFTWARE123456

EXPOSE 3000

# run tests and exit → container ends when tests finish
CMD ["npm", "test"]