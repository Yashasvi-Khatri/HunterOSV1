#!/bin/bash

# OpenRouter Chat - Quick Bun Commands
echo "🥖 OpenRouter Chat - Bun Commands"
echo ""
echo "📦 Available Commands:"
echo ""
echo "1️⃣  Start development server:"
echo "   cd apps/web && bun run dev"
echo ""
echo "2️⃣  Build for production:"
echo "   cd apps/web && bun run build"
echo ""
echo "3️⃣  Install dependencies:"
echo "   bun install"
echo ""
echo "4️⃣  Run type checking:"
echo "   cd apps/web && bun run type-check"
echo ""
echo "5️⃣  Use startup script:"
echo "   ./start-chat.sh"
echo ""
echo "🚀 Quick start (choose one):"
read -p "Enter option (1-5): " choice

case $choice in
    1)
        echo "🌐 Starting development server..."
        cd apps/web && bun run dev
        ;;
    2)
        echo "🏗️  Building for production..."
        cd apps/web && bun run build
        ;;
    3)
        echo "📦 Installing dependencies..."
        bun install
        ;;
    4)
        echo "🔍 Running type check..."
        cd apps/web && bun run type-check
        ;;
    5)
        echo "🚀 Using startup script..."
        ./start-chat.sh
        ;;
    *)
        echo "❌ Invalid option. Please choose 1-5."
        ;;
esac
