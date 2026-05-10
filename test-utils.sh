#!/bin/bash

# ============================================================
#  MCC Test Utilities
#  Usage: ./test-utils.sh [command]
# ============================================================

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

show_help() {
  echo -e "${BLUE}MCC Test Utilities${NC}"
  echo ""
  echo "Usage: ./test-utils.sh [command]"
  echo ""
  echo "Commands:"
  echo "  status              Check server and test status"
  echo "  start               Start HTTP server on port 8877"
  echo "  stop                Stop HTTP server"
  echo "  run-tests           Run API tests"
  echo "  latest-results      Show latest test results"
  echo "  open-register       Open register page in browser"
  echo "  logs                Show server logs"
  echo "  clean               Clean test result files"
  echo ""
}

check_status() {
  echo -e "${BLUE}Status Check${NC}"
  echo ""

  # Check server
  if lsof -Pi :8877 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${GREEN}✓ Server running${NC} on http://localhost:8877"
    PID=$(lsof -Pi :8877 -sTCP:LISTEN -t)
    echo "  PID: $PID"
  else
    echo -e "${RED}✗ Server not running${NC}"
  fi

  echo ""

  # Check GAS endpoint
  echo "Checking GAS endpoint..."
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://script.google.com/macros/s/AKfycbxHdzThlarsyCeUlf6wQJz4Ipq_z9I-VeAS1wwB8WGs97I31afoBsODZaVe-Eh5Obh-/exec" \
    --max-time 5)

  if [[ "$HTTP_CODE" == "302" ]]; then
    echo -e "${GREEN}✓ GAS endpoint responding${NC} (HTTP ${HTTP_CODE})"
  else
    echo -e "${RED}✗ GAS endpoint issue${NC} (HTTP ${HTTP_CODE})"
  fi

  echo ""

  # Check test results
  LATEST=$(ls -t test-results-*.txt 2>/dev/null | head -1)
  if [[ -n "$LATEST" ]]; then
    echo -e "Latest results: ${GREEN}$LATEST${NC}"
    tail -3 "$LATEST" | head -2
  else
    echo "No test results yet"
  fi
}

start_server() {
  if lsof -Pi :8877 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}Server already running${NC}"
  else
    echo "Starting server..."
    python3 -m http.server 8877 --directory . > /tmp/mcc-server.log 2>&1 &
    sleep 2
    PID=$(lsof -Pi :8877 -sTCP:LISTEN -t)
    echo -e "${GREEN}✓ Server started${NC} (PID: $PID)"
    echo "URL: http://localhost:8877"
  fi
}

stop_server() {
  if lsof -Pi :8877 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    PID=$(lsof -Pi :8877 -sTCP:LISTEN -t)
    kill $PID 2>/dev/null
    sleep 1
    echo -e "${GREEN}✓ Server stopped${NC}"
  else
    echo -e "${YELLOW}Server not running${NC}"
  fi
}

run_tests() {
  if [[ ! -f "test-registration.sh" ]]; then
    echo -e "${RED}✗ test-registration.sh not found${NC}"
    exit 1
  fi
  ./test-registration.sh
}

show_latest_results() {
  LATEST=$(ls -t test-results-*.txt 2>/dev/null | head -1)
  if [[ -n "$LATEST" ]]; then
    echo -e "${BLUE}Latest Results: ${YELLOW}$LATEST${NC}"
    echo ""
    cat "$LATEST"
  else
    echo "No test results found"
  fi
}

open_register() {
  URL="http://localhost:8877/#register"
  echo "Opening $URL"
  open "$URL" 2>/dev/null || xdg-open "$URL" 2>/dev/null || echo "Please open: $URL"
}

show_logs() {
  if [[ -f "/tmp/mcc-server.log" ]]; then
    echo -e "${BLUE}Server Logs${NC}"
    tail -50 /tmp/mcc-server.log
  else
    echo "No server logs found"
  fi
}

clean_results() {
  COUNT=$(ls test-results-*.txt 2>/dev/null | wc -l)
  if [[ $COUNT -gt 0 ]]; then
    rm test-results-*.txt
    echo -e "${GREEN}✓ Cleaned ${COUNT} result files${NC}"
  else
    echo "No result files to clean"
  fi
}

# Main
case "${1:-status}" in
  status)
    check_status
    ;;
  start)
    start_server
    ;;
  stop)
    stop_server
    ;;
  run-tests|test)
    run_tests
    ;;
  latest-results|results)
    show_latest_results
    ;;
  open-register|register)
    open_register
    ;;
  logs)
    show_logs
    ;;
  clean)
    clean_results
    ;;
  *)
    show_help
    ;;
esac
