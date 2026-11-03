FROM docker.io/oven/bun:1.4-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
COPY src src
USER bun
EXPOSE 3000
CMD ["bun", "src/server.ts"]
