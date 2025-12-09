# Use Node 20 Alpine
FROM node:20-alpine

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 1. Copy the "standalone" folder. 
# This contains a minimal node_modules and just the necessary server files.
COPY .next/standalone ./

# 2. Copy the "static" folder. 
# Standalone does NOT bundle static assets (css, images), so we must copy them manually.
COPY .next/static ./.next/static

# 3. Copy the "public" folder.
# For things like favicon.ico, robots.txt, etc.
COPY public ./public

EXPOSE 3000

CMD ["node", "server.js"]