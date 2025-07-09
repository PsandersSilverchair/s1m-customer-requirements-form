#!/bin/bash

echo "🚀 Setting up S1M Salesforce Backend Service"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   https://nodejs.org/en/download/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Navigate to server directory
cd server

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created from template"
    echo ""
    echo "🔧 Please edit the .env file with your Salesforce credentials:"
    echo "   - SALESFORCE_CLIENT_ID (Consumer Key from Connected App)"
    echo "   - SALESFORCE_CLIENT_SECRET (Consumer Secret from Connected App)"
    echo "   - SALESFORCE_URL (Your Salesforce org URL)"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Check if all dependencies are installed
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Edit server/.env file with your Salesforce credentials"
echo "2. Update your Salesforce Connected App callback URL to:"
echo "   http://localhost:3000/api/auth/callback"
echo "3. Run the server with: npm run dev"
echo "4. Test the integration at: http://localhost:3000/health"
echo ""
echo "📚 See server/README.md for detailed setup instructions"

# Optional: Open .env file in editor
read -p "Would you like to open the .env file now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v code &> /dev/null; then
        code .env
    elif command -v nano &> /dev/null; then
        nano .env
    else
        echo "Please manually edit the .env file with your preferred editor"
    fi
fi

echo ""
echo "🚀 Setup complete! You can now run:"
echo "   cd server"
echo "   npm run dev"