#!/usr/bin/env sh
# Serves the presentation locally and opens it (macOS / Linux). Press F for full screen.
# Served over http, the two advertising videos on slide 11 play inside the slide.
cd "$(dirname "$0")" || exit 1
PORT=8000
( sleep 1; (command -v open >/dev/null && open "http://localhost:$PORT/") || (command -v xdg-open >/dev/null && xdg-open "http://localhost:$PORT/") ) &
exec python3 -m http.server "$PORT" --bind 127.0.0.1
