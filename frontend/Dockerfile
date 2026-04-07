FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build || true

EXPOSE 3000

# Run dev server with direct path to next binary
CMD ["node", "node_modules/.bin/next", "dev", "-p", "3000"]
