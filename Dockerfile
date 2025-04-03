FROM node:20-alpine AS builder

# Install only needed build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    gcc \
    musl-dev \
    sqlite-dev

WORKDIR /build

# Copy only package files first (better cache utilization)
COPY package*.json ./

# Install with specific flags and clean cache
RUN npm ci --production \
    && npm cache clean --force

# Final stage
FROM node:20-alpine

# Install only runtime dependencies
RUN apk add --no-cache sqlite-dev

WORKDIR /app

# Copy only built modules and app files
COPY --from=builder /build/node_modules ./node_modules
COPY . .

VOLUME [ "/app/data" ]
ENV NODE_ENV=production

CMD ["node", "bot.js"]