FROM node:24-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

# Install ONLY production dependencies
RUN npm ci --only=production

# Install necessary build tools globally (tsx for execution)
RUN npm install -g tsx

# Generate Prisma Client specifically for Linux
RUN npx prisma generate

# Copy the rest of the built code
COPY . .

# Build the Vite frontend
RUN npm install --include=dev
RUN npm run build
RUN npm prune --production

ENV PORT=8080
EXPOSE 8080

# Use native node to run the server script directly
CMD [ "node", "--import", "tsx", "server/index.ts" ]
