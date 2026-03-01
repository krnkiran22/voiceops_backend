# Tactical Intelligence Terminal: Ollama + Node.js
FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create a startup script
RUN echo '#!/bin/bash\n\
ollama serve &\n\
sleep 5\n\
if [ "$AI_PROVIDER" = "ollama" ]; then\n\
  echo "🤖 Pulling Ollama Model: $AI_MODEL..."\n\
  ollama pull $AI_MODEL\n\
fi\n\
npm start' > /app/start.sh && chmod +x /app/start.sh

# Expose ports
EXPOSE 4000
EXPOSE 11434

# Start the combined service
CMD ["/app/start.sh"]
