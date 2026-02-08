# --- Stage 1: Base (Shared) ---
FROM docker.arvancloud.ir/node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

# --- Stage 2: Development ---
FROM base AS development
# Install all dependencies
RUN npm install
# Copy the rest of the code
COPY . .
# Vite dev server port
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# --- Stage 3: Build (Temporary stage for production) ---
FROM base AS build
# npm ci is faster and more reliable for builds than npm install
RUN npm ci 
COPY . .
# This creates the 'dist' folder
RUN npm run build

# --- Stage 4: Production (Final Image) ---
# We use Nginx instead of Node because it is much faster at serving static files
FROM docker.arvancloud.ir/nginx:stable-alpine AS production

# Copy the static files from the build stage to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom nginx config if you have one (optional but recommended for SPAs)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
