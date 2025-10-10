# JULES-10: Deployment & Infrastructure
# Dockerfile for Deep-Sensing Studio Backend API

# --- Stage 1: Builder ---
# This stage installs all dependencies (including dev) and builds the TypeScript source.
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package management files
# This leverages Docker's layer caching. Dependencies are only re-fetched if these files change.
COPY package.json ./
COPY package-lock.json ./

# Install all dependencies, including dev dependencies needed for the build
RUN npm install

# Copy the rest of the application source code
# The .dockerignore file will prevent unnecessary files from being copied.
COPY . .

# Compile TypeScript to JavaScript
# This command should create a `dist` directory with the compiled output.
RUN npm run build


# --- Stage 2: Runtime ---
# This stage creates the final, lean image with only production dependencies and compiled code.
FROM node:20-alpine AS runtime

WORKDIR /app

# Create a non-root user for security best practices
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy package management files again
COPY package.json ./
COPY package-lock.json ./

# Install ONLY production dependencies
RUN npm install --production

# Copy the compiled code and other necessary assets from the builder stage
COPY --from=builder /app/dist ./dist
# If Prisma is used, the schema is needed at runtime
COPY --from=builder /app/prisma ./prisma

# Expose the port the application will run on.
# This should match the PORT environment variable in render.yaml.
EXPOSE 10000

# Health check to ensure the service is responsive
# Render uses this to verify deployments and manage the service.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q --spider http://localhost:10000/health || exit 1

# The command to start the application in production
CMD [ "node", "dist/main.js" ]