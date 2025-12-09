# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy the standalone build output
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

RUN npm install

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
