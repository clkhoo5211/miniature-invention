#!/bin/bash
# IPFS/IPNS Deployment Script
# Builds Next.js app and publishes to IPFS/IPNS

set -e

echo "🚀 Starting IPFS/IPNS deployment..."

# Check if IPFS API URL is set
if [ -z "$IPFS_API_URL" ]; then
  echo "⚠️  IPFS_API_URL not set. Using default: http://127.0.0.1:5001"
  export IPFS_API_URL="${IPFS_API_URL:-http://127.0.0.1:5001}"
fi

# Check if IPFS node is accessible
echo "📡 Checking IPFS node connection..."
if ! curl -s "$IPFS_API_URL/api/v0/version" > /dev/null 2>&1; then
  echo "❌ Cannot connect to IPFS node at $IPFS_API_URL"
  echo "   Please ensure IPFS is running or set IPFS_API_URL to your IPFS gateway"
  exit 1
fi

echo "✅ IPFS node accessible"

# Build Next.js app
echo "🔨 Building Next.js application..."
npm run build

if [ ! -d "out" ]; then
  echo "❌ Build failed: 'out' directory not found"
  exit 1
fi

echo "✅ Build complete"

# Create tar.gz archive
echo "📦 Creating archive..."
ARCHIVE_NAME="build-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$ARCHIVE_NAME" -C out .

echo "✅ Archive created: $ARCHIVE_NAME"

# Upload to IPFS
echo "⬆️  Uploading to IPFS..."
CID=$(curl -s -X POST -F "file=@$ARCHIVE_NAME" "$IPFS_API_URL/api/v0/add?pin=true" | jq -r '.Hash')

if [ -z "$CID" ] || [ "$CID" = "null" ]; then
  echo "❌ IPFS upload failed"
  exit 1
fi

echo "✅ Uploaded to IPFS: $CID"
echo "   IPFS URL: https://ipfs.io/ipfs/$CID"
echo "   Gateway URL: $IPFS_API_URL/ipfs/$CID"

# Publish to IPNS (optional)
if [ "$PUBLISH_TO_IPNS" = "true" ]; then
  echo "📢 Publishing to IPNS..."
  IPNS_KEY="${IPNS_KEY:-self}"
  
  IPNS_NAME=$(curl -s -X POST "$IPFS_API_URL/api/v0/name/publish?arg=/ipfs/$CID&key=$IPNS_KEY" | jq -r '.Name')
  
  if [ -z "$IPNS_NAME" ] || [ "$IPNS_NAME" = "null" ]; then
    echo "⚠️  IPNS publish failed, but IPFS upload succeeded"
    echo "   You can manually publish later: ipfs name publish /ipfs/$CID"
  else
    echo "✅ Published to IPNS: $IPNS_NAME"
    echo "   IPNS URL: https://ipfs.io/ipns/$IPNS_NAME"
  fi
else
  echo "ℹ️  Skipping IPNS publish (set PUBLISH_TO_IPNS=true to enable)"
fi

# Cleanup
rm -f "$ARCHIVE_NAME"
echo "🧹 Cleaned up temporary archive"

echo ""
echo "✨ Deployment complete!"
echo "   CID: $CID"
if [ -n "$IPNS_NAME" ]; then
  echo "   IPNS: $IPNS_NAME"
fi
echo ""
echo "To publish to IPNS later:"
echo "  ipfs name publish /ipfs/$CID"
echo ""
echo "Or via API:"
echo "  curl -X POST \"$IPFS_API_URL/api/v0/name/publish?arg=/ipfs/$CID&key=self\""

