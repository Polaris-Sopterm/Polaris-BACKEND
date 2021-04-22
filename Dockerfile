FROM node:14.16.0-alpine3.11

# Create application directory.
WORKDIR /usr/src/app

# Install dependencies.
COPY package*.json ./
RUN npm ci --only=production

# Copy other source codes.
COPY . .

# Expose port.
ENV PORT 80
EXPOSE 80

# Run server.
ENTRYPOINT npx sequelize-cli db:migrate --debug && npm run start
