#!/usr/bin/env bash
# Start the Sober-Body and PronunCo dev servers.
#
# Optional flags:
#   -p | --pull     Pull the latest git changes before starting.
#   -t | --test     Run unit tests before starting.
#   -i | --install  Run 'pnpm install' before starting.

set -euo pipefail

RUN_PULL=false
RUN_TESTS=false
RUN_INSTALL=false

SESSION=sober
PORT_SB=5173
PORT_PC=5174
DEV_PORTS=(5173 5174 5175 5176)

edge() {
  if command -v microsoft-edge >/dev/null 2>&1; then
    microsoft-edge "$1" &
  else
    xdg-open "$1" &
  fi
}

cleanup_tmux() {
  tmux has-session -t "$SESSION" 2>/dev/null && tmux kill-session -t "$SESSION"
}

cleanup_ports() {
  for port in "$PORT_SB" "$PORT_PC"; do
    pid=$(lsof -ti tcp:"$port") || true
    if [[ -n "$pid" ]]; then
      echo "   • Killing process $pid on port $port"
      kill "$pid" || true
    fi
  done
}

is_port_free() { ! lsof -i :"$1" >/dev/null 2>&1; }

report_ports() {
  for port in "${DEV_PORTS[@]}"; do
    if is_port_free "$port"; then
      echo "Port $port is free"
    else
      echo "Port $port is taken"
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

echo "▶ Cleaning up previous dev environment …"
cleanup_tmux
cleanup_ports

echo "✅ Ports cleared. Spinning up dev servers …"

echo "➡  Opening Microsoft Edge at:"
echo "   • http://localhost:$PORT_SB/decks     (Sober-Body)"
echo "   • http://localhost:$PORT_PC/pc/decks (PronunCo)"
edge "http://localhost:${PORT_SB}/decks"
edge "http://localhost:${PORT_PC}/pc/decks"

if command -v tmux >/dev/null 2>&1; then
  tmux new-session -d -s "$SESSION" \
    "pnpm dev:sb -- --port $PORT_SB"
  tmux split-window -h \
    "pnpm dev:pc -- --port $PORT_PC"
  sleep 2
  report_ports
  tmux attach-session -t "$SESSION"
else
  echo "tmux not found, starting servers in a single terminal."
  pnpm dev:sb -- --port "$PORT_SB" &
  PID_SB=$!
  pnpm dev:pc -- --port "$PORT_PC" &
  PID_PC=$!
  sleep 2
  report_ports
  wait $PID_SB $PID_PC
fi
