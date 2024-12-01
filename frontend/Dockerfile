# Use a lightweight Node.js base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy only the package.json and pnpm-lock.yaml first for better caching
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy the entire project into the container
COPY . .

# Expose the port your frontend app will run on (default for Vite/React is 5173)
EXPOSE 5173

# Start the app in dev mode
CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0"]
