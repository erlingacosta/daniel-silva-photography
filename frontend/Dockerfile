# Build stage - compile Next.js
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Build Next.js application
RUN npm run build

# Production stage - serve the built app
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies (plus next for running)
RUN npm install --omit=dev && npm install next

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src

EXPOSE 3000

# Start Next.js in production mode
CMD ["npx", "next", "start", "-p", "3000"]
