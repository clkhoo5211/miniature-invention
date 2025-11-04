#!/bin/bash
# Simplified IPFS Deployment Script
# Requires: tar, curl, jq

set -e

IPFS_API_URL="${IPFS_API_URL:-http://127.0.0.1:5001}"
PUBLISH_TO_IPNS="${PUBLISH_TO_IPNS:-false}"
IPNS_KEY="${IPNS_KEY:-self}"

echo "🚀 Deploying to IPFS..."

# Build
echo "🔨 Building..."
npm run build

# Check IPFS
echo "📡 Checking IPFS..."
if ! curl -s "$IPFS_API_URL/api/v0/version" > /dev/null 2>&1; then
  echo "❌ IPFS not available at $IPFS_API_URL"
  exit 1
fi

# Create archive
ARCHIVE="build-$(date +%Y%m%d-%H%M%S).tar.gz"
echo "📦 Creating archive: $ARCHIVE"
tar -czf "$ARCHIVE" -C out .

# Upload
echo "⬆️  Uploading..."
CID=$(curl -s -X POST -F "file=@$ARCHIVE" "$IPFS_API_URL/api/v0/add?pin=true" | jq -r '.Hash')

if [ -z "$CID" ] || [ "$CID" = "null" ]; then
  echo "❌ Upload failed"
  rm -f "$ARCHIVE"
  exit 1
fi

echo "✅ Uploaded: $CID"
echo "   https://ipfs.io/ipfs/$CID"

# IPNS (optional)
if [ "$PUBLISH_TO_IPNS" = "true" ]; then
  echo "📢 Publishing to IPNS..."
  IPNS_NAME=$(curl -s -X POST "$IPFS_API_URL/api/v0/name/publish?arg=/ipfs/$CID&key=$IPNS_KEY" | jq -r '.Name')
  if [ -n "$IPNS_NAME" ] && [ "$IPNS_NAME" != "null" ]; then
    echo "✅ IPNS: $IPNS_NAME"
    echo "   https://ipfs.io/ipns/$IPNS_NAME"
  fi
fi

rm -f "$ARCHIVE"
echo "✨ Done!"

