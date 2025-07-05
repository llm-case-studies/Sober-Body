#!/usr/bin/env bash
# Opens SB and PC dev servers in a tmux split.
tmux new -d -s sober 'pnpm dev:sb'
tmux split-window -h 'pnpm dev:pc'
echo "➡  Open Microsoft Edge and browse:"
echo "   • http://localhost:5173  (Sober-Body)"
echo "   • http://localhost:5174  (PronunCo beta)"
tmux attach -t sober
