# --- Stage 1: Base ---
FROM docker.arvancloud.ir/python:3.13-slim AS base

ARG PROXY_URL

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Configure APT to use the proxy, install, then remove the config to keep the image clean
RUN if [ -n "$PROXY_URL" ]; then \
        echo "Acquire::http::Proxy \"$PROXY_URL\";" > /etc/apt/apt.conf.d/99proxy; \
        echo "Acquire::https::Proxy \"$PROXY_URL\";" >> /etc/apt/apt.conf.d/99proxy; \
    fi && \
    apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq5 \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/* \
    && rm -f /etc/apt/apt.conf.d/99proxy

# --- Stage 2: Development ---
FROM base AS development

# Copy dependency files
COPY pyproject.toml ./
# Install all dependencies (including dev ones)
RUN pip install -i https://mirror-pypi.runflare.com/simple --no-cache-dir .

# Copy the rest of the code
COPY . .

# Run with hot-reload enabled
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# --- Stage 3: Production Build ---
FROM base AS production

# Create a non-root user for security
RUN useradd -m appuser
USER appuser

# Install only production dependencies
COPY --chown=appuser:appuser pyproject.toml ./
RUN pip install -i https://mirror-pypi.runflare.com/simple --no-cache-dir --user .

# Copy application code
COPY --chown=appuser:appuser . .

# Ensure the local bin is in PATH for the user
ENV PATH="/home/appuser/.local/bin:${PATH}"

# Run without --reload and with optimized settings
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
