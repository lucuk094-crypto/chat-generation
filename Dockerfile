# Use Node.js 22 Alpine
FROM node:22-alpine

# Install FFmpeg and build dependencies
RUN apk add --no-cache \
    ffmpeg \
    libc6-compat \
    python3 \
    make \
    g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (dev + prod)
RUN npm ci

# Copy all application files
COPY . .

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Remove devDependencies to reduce size (optional)
# RUN npm prune --production

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
