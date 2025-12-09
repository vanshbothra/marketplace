# Use Node 20 Alpine
FROM node:20-alpine

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 1. Copy the standalone folder (contains server.js and minimal node_modules)
# Since your ls -la showed server.js is directly inside standalone, we copy it to root.
COPY .next/standalone ./

# 2. Copy static assets (CSS/Images)
# These are NOT included in standalone, so we must copy them explicitly.
COPY .next/static ./.next/static

# 3. Copy public folder (favicon, etc)
COPY public ./public

EXPOSE 3000

# Run the server directly (no npm start needed for standalone)
CMD ["node", "server.js"]