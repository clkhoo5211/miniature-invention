#!/bin/bash
# Quick IPFS Local Testing Script

set -e

echo "🧪 IPFS Local Testing Script"
echo ""

# Check if IPFS is running
IPFS_API="${IPFS_API_URL:-http://127.0.0.1:5001}"
echo "📡 Checking IPFS node at $IPFS_API..."

if curl -s "$IPFS_API/api/v0/version" > /dev/null 2>&1; then
    echo "✅ IPFS node is accessible"
else
    echo "❌ IPFS node not accessible"
    echo ""
    echo "Please start IPFS first:"
    echo "  Option 1: docker-compose up -d ipfs"
    echo "  Option 2: ipfs daemon"
    exit 1
fi

# Get IPFS version
VERSION=$(curl -s "$IPFS_API/api/v0/version" | grep -o '"Version":"[^"]*"' | cut -d'"' -f4)
echo "   Version: $VERSION"
echo ""

# Test adding a file
echo "📤 Testing IPFS add..."
TEST_FILE="/tmp/ipfs-test-$(date +%s).txt"
echo "Hello IPFS Test - $(date)" > "$TEST_FILE"

CID=$(curl -s -X POST -F "file=@$TEST_FILE" "$IPFS_API/api/v0/add?pin=true" | grep -o '"Hash":"[^"]*"' | cut -d'"' -f4)

if [ -z "$CID" ]; then
    echo "❌ Failed to add file to IPFS"
    rm -f "$TEST_FILE"
    exit 1
fi

echo "✅ File added successfully"
echo "   CID: $CID"
echo ""

# Test retrieving
GATEWAY="${IPFS_GATEWAY:-http://127.0.0.1:8081}"
echo "📥 Testing IPFS gateway at $GATEWAY..."
if curl -s "$GATEWAY/ipfs/$CID" > /dev/null 2>&1; then
    echo "✅ Gateway is working"
    CONTENT=$(curl -s "$GATEWAY/ipfs/$CID")
    echo "   Retrieved content: ${CONTENT:0:50}..."
else
    echo "⚠️  Gateway not accessible (might be normal if using external gateway)"
fi

# Cleanup
rm -f "$TEST_FILE"

echo ""
echo "✨ IPFS testing complete!"
echo "   CID: $CID"
echo "   Gateway URL: $GATEWAY/ipfs/$CID"
echo ""
