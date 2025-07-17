#!/usr/bin/env bash
# Banner for PR 163
echo "────────────────────────────────────────────────────────────"
echo "🔧  Sober-Body Dev Script – changes for PR #163"
echo "────────────────────────────────────────────────────────────"
# Idempotent dev helper for Sober-Body & PronunCo.
#
# Flags:
#   -r | --remote    remote-first workflow (pull + install)
#   -t | --test      run tests
#   -s | --start     start dev servers (default when no args)
#   -p | --pull      git pull --rebase --autostash (use with caution)
#   -i | --install   pnpm install (usually not needed locally)
#   -b | --build     build pronunco for production
#   -d | --deploy    serve built pronunco locally for testing
#   --syncdocs       regenerate docs/INDEX.md from folder structure
#
# Common combinations:
#   ./dev.sh         → start servers (local dev)
#   ./dev.sh -t      → test only
#   ./dev.sh -t -s   → test then start
#   ./dev.sh -r      → pull + install (remote setup)
#   ./dev.sh -r -t   → pull + install + test
#   ./dev.sh -r -s   → pull + install + start
#   ./dev.sh -r -t -s → pull + install + test + start
#   ./dev.sh --syncdocs → regenerate docs index

set -euo pipefail

# ───────── configuration ─────────
SESSION=sober
PORT_SB=5173
PORT_PC=5174
PORT_SERVE=8080
DEV_PORTS=("$PORT_SB" "$PORT_PC" "$PORT_SERVE")
URL_SB="http://localhost:${PORT_SB}/decks"
URL_PC="http://localhost:${PORT_PC}/pc/decks"
# ──────────────────────────────────

run_pull=false run_install=false run_tests=false run_start=false
run_build=false run_deploy=false run_syncdocs=false
debug_handles=false
[[ $# -eq 0 ]] && run_start=true        # default action

while [[ $# -gt 0 ]]; do
  case "$1" in
    --debug-handles) debug_handles=true ;;
    -r|--remote)   run_pull=true; run_install=true ;;
    -p|--pull)     run_pull=true;;
    -i|--install)  run_install=true;;
    -t|--test)     run_tests=true ;;
    -s|--start)    run_start=true ;;
    -b|--build)    run_build=true ;;
    -d|--deploy)   run_deploy=true ;;
    --syncdocs)    run_syncdocs=true ;;
    *) echo "Usage: $0 [--debug-handles] [-r] [-t] [-s] [-p] [-i] [-b] [-d] [--syncdocs]" && exit 1;;
  esac
  shift
done

# Export exact string "true" when handle tracing is requested
DEBUG_HANDLES=${debug_handles:+true}
echo "DEBUG_HANDLES flag (bash bool) = $debug_handles"
echo "DEBUG_HANDLES exported string  = ${DEBUG_HANDLES:-''}"

#─── helpers ──────────────────────────────────────────────────────────────
edge () {
  if command -v microsoft-edge >/dev/null 2>&1; then
    microsoft-edge "$@" >/dev/null 2>&1 &
  else
    xdg-open       "$@" >/dev/null 2>&1 &
  fi
}

cleanup_ports () {
  for port in "$PORT_SB" "$PORT_PC" "$PORT_SERVE"; do
    lsof -ti tcp:"$port" 2>/dev/null || true | while read -r pid; do
      [[ -z $pid ]] && continue
      echo "  • SIGTERM $pid (port $port)"; kill -15 "$pid" 2>/dev/null || true
      sleep 1
      if lsof -p "$pid" &>/dev/null; then
        echo "  • SIGKILL $pid"; kill -9 "$pid" 2>/dev/null || true
      fi
    done
  done
}

cleanup_tmux () {
  if command -v tmux &>/dev/null && tmux has-session -t "$SESSION" 2>/dev/null; then
    echo "  • Killing old tmux session '$SESSION'"
    tmux kill-session -t "$SESSION"
  fi
}

report_ports () {
  for p in "${DEV_PORTS[@]}"; do
    lsof -ti tcp:"$p" -sTCP:LISTEN &>/dev/null \
      && echo "Port $p  🔒  taken" \
      || echo "Port $p  ✅  free"
  done
}
#──────────────────────────────────────────────────────────────────────────

$run_pull    && { echo "↻ git pull …";      git pull --rebase --autostash; }
$run_install && { echo "📦 pnpm install …";  pnpm install; }

# ─── Build & Deploy ───
if $run_build; then
  echo "📦 Building PronunCo for static deploy…"
  cd apps/pronunco
  VITE_ROUTER_BASE=/ BUILD_BASE=/ npx vite build
  cd ../..
  echo "✅ Build complete: apps/pronunco/dist/"
fi

if $run_deploy; then
  echo "🚀 Serving PronunCo dist on http://localhost:${PORT_SERVE}"
  cleanup_ports  # Free up the port first
  cd apps/pronunco/dist
  echo "Starting server... Press Ctrl+C to stop"
  python3 -m http.server "${PORT_SERVE}"
  exit 0
fi

# ─── Sync Docs ───
if $run_syncdocs; then
  echo "📚 Regenerating docs/INDEX.md from folder structure…"
  if [[ -f "docs/scripts/build-index.js" ]]; then
    node docs/scripts/build-index.js
    echo "✅ Documentation index updated"
  else
    echo "❌ Error: docs/scripts/build-index.js not found"
    echo "   Make sure you're in the repository root directory"
    exit 1
  fi
  exit 0
fi
if $run_tests; then
  echo -e "\n🏃‍♂️  Running unit tests with per-file timing …\n"

  # Sober-Body app
  echo "— apps/sober-body —"
  time pnpm test:unit:sb -- --reporter=verbose
  echo "✅ Vitest finished apps/sober-body with exit code $?"

  # PronunCo app
  echo -e "\n— apps/pronunco —"
  echo "⏳ Launching PronunCo tests … Vitest should be idle now"
  (
    DEBUG_HANDLES=$DEBUG_HANDLES \
    time timeout 600 \
      pnpm --filter ./apps/pronunco exec vitest run --reporter=verbose
  )

  # Shared packages  (optional – keep if/when you add tests there)
  if pnpm m ls -r --depth=-1 | grep -qE '^packages/'; then
    echo -e "\n— packages —"
    time pnpm -r --filter "packages/**" exec vitest run --reporter=verbose
  fi

  echo -e "\n✅  All test suites finished."
fi

$run_start || exit 0

echo "▶ Cleaning previous dev env …"
cleanup_ports
cleanup_tmux
echo "✅ Ports status:"; report_ports

echo "🌐 Opening Edge tabs …"
edge "$URL_SB"
edge "$URL_PC"

if command -v tmux &>/dev/null; then
  tmux new-session  -d -s "$SESSION" "pnpm dev:sb -- --port $PORT_SB"
  tmux split-window -h               "pnpm dev:pc -- --port $PORT_PC"
  sleep 2 && report_ports
  tmux attach -t "$SESSION"
else
  echo "tmux not found → starting servers in current terminal."
  pnpm dev:sb -- --port "$PORT_SB" & pid_sb=$!
  pnpm dev:pc -- --port "$PORT_PC" & pid_pc=$!
  sleep 2 && report_ports
  trap "kill $pid_sb $pid_pc" SIGINT SIGTERM
  wait
fi
