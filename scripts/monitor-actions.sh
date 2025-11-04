#!/usr/bin/env bash

# Simple monitor for GitHub Actions workflow status
# Requires a GitHub Personal Access Token with 'repo' scope
# Usage:
#   export GITHUB_PAT=YOUR_TOKEN
#   ./scripts/monitor-actions.sh <owner> <repo> <workflow_file> [branch]
# Example:
#   ./scripts/monitor-actions.sh clkhoo5211 miniature-invention deploy.yml main

OWNER="$1"
REPO="$2"
WORKFLOW_FILE="$3"
BRANCH="${4:-main}"

if [ -z "$OWNER" ] || [ -z "$REPO" ] || [ -z "$WORKFLOW_FILE" ]; then
  echo "Usage: $0 <owner> <repo> <workflow_file> [branch]"
  exit 1
fi

if [ -z "$GITHUB_PAT" ]; then
  echo "Error: GITHUB_PAT environment variable is not set."
  echo "Please create a Personal Access Token (repo scope) and export it:"
  echo "  export GITHUB_PAT=YOUR_TOKEN"
  exit 1
fi

API_URL="https://api.github.com/repos/$OWNER/$REPO/actions/workflows/$WORKFLOW_FILE/runs?branch=$BRANCH&per_page=1"

echo "Monitoring workflow runs for $OWNER/$REPO ($WORKFLOW_FILE on branch $BRANCH)"
echo "Press Ctrl+C to exit."

while true; do
  RESPONSE=$(curl -s -H "Accept: application/vnd.github+json" \
                  -H "Authorization: Bearer $GITHUB_PAT" \
                  "$API_URL")

  STATUS=$(echo "$RESPONSE" | jq -r '.workflow_runs[0].status // "unknown"')
  CONCLUSION=$(echo "$RESPONSE" | jq -r '.workflow_runs[0].conclusion // "pending"')
  HTML_URL=$(echo "$RESPONSE" | jq -r '.workflow_runs[0].html_url // ""')
  UPDATED_AT=$(echo "$RESPONSE" | jq -r '.workflow_runs[0].updated_at // ""')

  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$TIMESTAMP] status=$STATUS conclusion=$CONCLUSION updated_at=$UPDATED_AT"
  if [ -n "$HTML_URL" ]; then
    echo "Details: $HTML_URL"
  fi

  # If completed, show a friendly message
  if [ "$STATUS" = "completed" ]; then
    if [ "$CONCLUSION" = "success" ]; then
      echo "✅ Workflow succeeded."
    else
      echo "❌ Workflow failed (conclusion=$CONCLUSION)."
    fi
  fi

  sleep 30
done