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
DEV_PORTS=(5173 5174 5175 5176)

free_port() {
  local port=$1
  if command -v pnpx >/dev/null 2>&1; then
    pnpx --yes kill-port "$port" >/dev/null 2>&1 || true
  elif command -v npx >/dev/null 2>&1; then
    npx -y kill-port "$port" >/dev/null 2>&1 || true
  fi
  # Fallback to lsof if kill-port is unavailable or fails
  if lsof -ti :"$port" >/dev/null 2>&1; then
    lsof -ti :"$port" | xargs -r kill >/dev/null 2>&1 || true
    if lsof -ti :"$port" >/dev/null 2>&1; then
      echo "Port $port still taken; trying sudo..." >&2
      if command -v pnpx >/dev/null 2>&1; then
        sudo pnpx --yes kill-port "$port" >/dev/null 2>&1 || true
      elif command -v npx >/dev/null 2>&1; then
        sudo npx -y kill-port "$port" >/dev/null 2>&1 || true
      fi
      lsof -ti :"$port" | xargs -r sudo kill >/dev/null 2>&1 || true
    fi
  fi
}

is_port_free() {
  ! lsof -i :"$1" >/dev/null 2>&1
}

ensure_port_free() {
  local port=$1
  free_port "$port"
  for _ in {1..5}; do
    if is_port_free "$port"; then
      echo "Port $port is free"
      return 0
    fi
    sleep 1
  done
  echo "Error: port $port is still in use" >&2
  exit 1
}

report_ports() {
  for port in "${DEV_PORTS[@]}"; do
    if is_port_free "$port"; then
      echo "Port $port is free"
    else
      echo "Port $port is taken"
    fi
  done
}

verify_ports() {
  for port in 5173 5174; do
    if is_port_free "$port"; then
      echo "Error: expected port $port in use" >&2
      exit 1
    fi
  done
  for port in 5175 5176; do
    if ! is_port_free "$port"; then
      echo "Error: unexpected process on port $port" >&2
      exit 1
    fi
  done
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
  git pull --rebase --autostash
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
  ensure_port_free "$port"
done

echo "➡  Opening Microsoft Edge at:"
echo "   • http://localhost:5173  (Sober-Body)"
if command -v microsoft-edge >/dev/null 2>&1; then
  microsoft-edge http://localhost:5173 &
else
  echo "Microsoft Edge not found in PATH; please open the URL manually."
fi

if command -v tmux >/dev/null 2>&1; then
  # Use tmux when available for split-pane dev servers.
  tmux new -d -s sober 'pnpm dev:sb'
  tmux split-window -h 'pnpm dev:pc'
  sleep 2
  verify_ports
  report_ports
  tmux attach -t sober
else
  echo "tmux not found, starting servers in a single terminal."
  pnpm dev:all &
  DEV_PID=$!
  sleep 2
  verify_ports
  report_ports
  wait $DEV_PID
fi
