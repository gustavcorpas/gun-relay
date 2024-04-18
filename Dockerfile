
# Start you image with a node base image
FROM oven/bun:alpine

WORKDIR /app

# Copy package
COPY package.json package.json
COPY bun.lockb bun.lockb
RUN bun install

# Copy relevant files
COPY ./src ./src
COPY relay-config.json ./
COPY index.ts ./

# Install and build
RUN bun i

EXPOSE 3000

# Start
CMD [ "bun", "run", "start" ]