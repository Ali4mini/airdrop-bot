FROM python:3.13-slim

# 1. Install system dependencies required for the installer
# We combine these to keep the image size small
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 2. Download and install uv
# We set the installation directory to /usr/local/bin so it's globally available
ENV UV_INSTALL_DIR="/usr/local/bin"
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# 3. Set working directory
WORKDIR /app

# 4. Prevent uv from creating a virtual environment inside the container
# This makes Docker management easier as it installs to system site-packages
ENV UV_SYSTEM_PYTHON=1

# 5. Copy dependency files first for caching
COPY pyproject.toml uv.lock* ./

# 6. Install dependencies
# Using --system because we are inside a container and don't need a venv
RUN uv pip install -r pyproject.toml

# 7. Copy the rest of the code
COPY . .

# 8. Run the application
# We bind to 0.0.0.0 so the container is accessible from outside
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
