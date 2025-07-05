#!/usr/bin/env bash
# Start the Sober-Body and PronunCo dev servers.
#
# Optional flags:
#   -p | --pull     Pull the latest git changes before starting.
#   -t | --test     Run unit tests before starting.
#   -i | --install  Run 'pnpm install' before starting.

set -e

RUN_PULL=false
RUN_TESTS=false
RUN_INSTALL=false
STASHED=false
DEV_PORTS=(5173 5174)

free_port() {
  local port=$1
  local pids
  pids=$(lsof -ti tcp:"$port" 2>/dev/null)
  if [[ -n "$pids" ]]; then
    echo "Freeing port $port (killing $pids)"
    kill -9 $pids || true
  fi
}

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
    -i|--install)
      RUN_INSTALL=true
      shift
      ;;
    *)
      echo "Usage: $0 [-p|--pull] [-t|--test] [-i|--install]"
      exit 1
      ;;
  esac
done

if $RUN_PULL; then
  echo "Pulling latest changes..."
  if ! git diff-index --quiet HEAD --; then
    echo "Stashing local changes..."
    git stash push --include-untracked --message "dev.sh auto-stash" >/dev/null
    STASHED=true
  fi
  git pull --rebase
  if $STASHED; then
    echo "Restoring stashed changes..."
    git stash pop --index >/dev/null || true
  fi
fi

if $RUN_INSTALL; then
  echo "Installing dependencies..."
  pnpm install
fi

if $RUN_TESTS; then
  echo "Running unit tests..."
  pnpm test:unit
fi

# Ensure dev ports are free before starting servers
for port in "${DEV_PORTS[@]}"; do
  free_port "$port"
done

echo "➡  Opening Microsoft Edge at:"
echo "   • http://localhost:5173  (Sober-Body)"
echo "   • http://localhost:5174/pc/decks  (PronunCo)"
if command -v microsoft-edge >/dev/null 2>&1; then
  microsoft-edge http://localhost:5173 http://localhost:5174/pc/decks &
else
  echo "Microsoft Edge not found in PATH; please open the URLs manually."
fi

if command -v tmux >/dev/null 2>&1; then
  # Use tmux when available for split-pane dev servers.
  tmux new -d -s sober 'pnpm dev:sb'
  tmux split-window -h 'pnpm dev:pc'
  tmux attach -t sober
else
  echo "tmux not found, starting servers in a single terminal."
  pnpm dev:all
fi
