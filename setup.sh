#!/bin/bash

# IG Obsessed Backend Setup Script
echo "🚀 Setting up IG Obsessed Backend..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your Supabase credentials before running the application."
    echo "   Required variables:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_ANON_KEY"
    echo ""
    read -p "Press Enter to continue after editing .env file..."
fi

# Check if required environment variables are set
if ! grep -q "SUPABASE_URL=https://" .env || ! grep -q "SUPABASE_ANON_KEY=ey" .env; then
    echo "⚠️  Please make sure to set SUPABASE_URL and SUPABASE_ANON_KEY in .env file"
    echo "   Current .env content:"
    cat .env
    echo ""
    read -p "Press Enter to continue after updating .env file..."
fi

# Ask user which environment to run
echo "🔧 Choose environment:"
echo "1) Development (with hot reload)"
echo "2) Production"
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo "🔨 Starting development environment..."
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    2)
        echo "🚀 Starting production environment..."
        docker-compose up --build -d
        echo "✅ Production environment started!"
        echo "📊 API available at: http://localhost:3001"
        echo "📚 API Documentation: http://localhost:3001/api-docs"
        echo "📋 View logs: docker-compose logs -f"
        echo "🛑 Stop: docker-compose down"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo "✅ Setup complete!"