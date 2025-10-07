FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml* package-lock.json* ./
RUN corepack enable && corepack prepare pnpm@latest --activate || true
RUN pnpm -v || npm i -g pnpm
COPY . .
RUN pnpm install
EXPOSE 3000
CMD ["pnpm","dev","-p","3000"]
