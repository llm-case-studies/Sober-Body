#!/usr/bin/env bash
# Start the Sober-Body and PronunCo dev servers.
#
# Optional flags:
#   -p | --pull   Pull the latest git changes before starting.
#   -t | --test   Run unit tests before starting.

set -e

RUN_PULL=false
RUN_TESTS=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -p|--pull)
      RUN_PULL=true
      shift
      ;;
    -t|--test)
      RUN_TESTS=true
      shift
      ;;
    *)
      echo "Usage: $0 [-p|--pull] [-t|--test]"
      exit 1
      ;;
  esac
done

if $RUN_PULL; then
  echo "Pulling latest changes..."
  git pull
fi

if $RUN_TESTS; then
  echo "Running unit tests..."
  pnpm test:unit
fi

echo "➡  Open Microsoft Edge and browse:"
echo "   • http://localhost:5173  (Sober-Body)"
echo "   • http://localhost:5174  (PronunCo beta)"

if command -v tmux >/dev/null 2>&1; then
  # Use tmux when available for split-pane dev servers.
  tmux new -d -s sober 'pnpm dev:sb'
  tmux split-window -h 'pnpm dev:pc'
  tmux attach -t sober
else
  echo "tmux not found, starting servers in a single terminal."
  pnpm dev:all
fi
