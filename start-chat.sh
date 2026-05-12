#!/bin/bash

# OpenRouter Chat - Terminal Startup Script (Bun Optimized)
echo "🚀 Starting OpenRouter Chat with Bun..."

# Kill any existing processes on port 3000-3005
echo "🧹 Clearing ports 3000-3005..."
for port in {3000..3005}; do
    lsof -ti:$port | xargs kill -9 2>/dev/null
done

# Navigate to web directory
cd apps/web

# Start the development server with Bun
echo "🌐 Starting development server on port 3001 with Bun..."
bun run dev
