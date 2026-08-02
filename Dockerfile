# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine

# Install FFmpeg and other required dependencies
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    make \
    g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build Next.js application
RUN npm run build

# Expose port (Railway will assign PORT env variable)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
