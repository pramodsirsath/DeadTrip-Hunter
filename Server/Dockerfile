# Use Node.js LTS image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package files and Python requirements
COPY package*.json ./
COPY requirements.txt ./

# Install Node dependencies
RUN npm install

# Install Python and ML dependencies in a virtual environment
RUN apt-get update \
  && apt-get install -y python3 python3-venv python3-pip \
  && python3 -m venv /opt/venv \
  && /opt/venv/bin/pip install --no-cache-dir -r requirements.txt \
  && ln -sf /opt/venv/bin/python /usr/bin/python \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY . .

# Expose backend port
EXPOSE 3000

# Start the backend
CMD ["npm", "start"]