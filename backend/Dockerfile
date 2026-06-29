FROM node:20-alpine

# Set production environment
ENV NODE_ENV=production

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package configurations
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy source files and root entry point
COPY src/ ./src
COPY server.js ./

# Set folder ownership to non-root node user
RUN chown -R node:node /usr/src/app

# Run under the non-root node user
USER node

# Expose app runtime port
EXPOSE 5000

# Run entry point
CMD ["node", "server.js"]
