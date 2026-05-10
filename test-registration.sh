#!/bin/bash

# ============================================================
#  MCC Season 1 — Registration Form Test Script
#  Usage: ./test-registration.sh
# ============================================================

SCRIPT_URL="https://script.google.com/macros/s/AKfycbxHdzThlarsyCeUlf6wQJz4Ipq_z9I-VeAS1wwB8WGs97I31afoBsODZaVe-Eh5Obh-/exec"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_FILE="test-results-${TIMESTAMP}.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================================${NC}"
echo -e "${BLUE}  MCC Registration Form — Automated Test Suite${NC}"
echo -e "${BLUE}========================================================${NC}"
echo ""

# Create test payload function
create_test_payload() {
  local company=$1
  local pic_name=$2
  local pic_wa=$3

  cat <<EOF
{
  "company": "${company}",
  "pic_name": "${pic_name}",
  "pic_wa": "${pic_wa}",
  "berkas": null,
  "teams": [
    {
      "name": "${company} Team A",
      "captain_name": "Captain A",
      "captain_wa": "6281111111",
      "logo": null,
      "players": [
        { "name": "Player 1", "game_id": "1001", "game_nick": "nick1" },
        { "name": "Player 2", "game_id": "1002", "game_nick": "nick2" },
        { "name": "Player 3", "game_id": "1003", "game_nick": "nick3" },
        { "name": "Player 4", "game_id": "1004", "game_nick": "nick4" },
        { "name": "Player 5", "game_id": "1005", "game_nick": "nick5" }
      ]
    },
    {
      "name": "${company} Team B",
      "captain_name": "Captain B",
      "captain_wa": "6282222222",
      "logo": null,
      "players": [
        { "name": "Player 6", "game_id": "2001", "game_nick": "nick6" },
        { "name": "Player 7", "game_id": "2002", "game_nick": "nick7" },
        { "name": "Player 8", "game_id": "2003", "game_nick": "nick8" },
        { "name": "Player 9", "game_id": "2004", "game_nick": "nick9" },
        { "name": "Player 10", "game_id": "2005", "game_nick": "nick10" }
      ]
    },
    {
      "name": "${company} Team C",
      "captain_name": "Captain C",
      "captain_wa": "6283333333",
      "logo": null,
      "players": [
        { "name": "Player 11", "game_id": "3001", "game_nick": "nick11" },
        { "name": "Player 12", "game_id": "3002", "game_nick": "nick12" },
        { "name": "Player 13", "game_id": "3003", "game_nick": "nick13" },
        { "name": "Player 14", "game_id": "3004", "game_nick": "nick14" },
        { "name": "Player 15", "game_id": "3005", "game_nick": "nick15" }
      ]
    }
  ]
}
EOF
}

# Test function
run_test() {
  local test_num=$1
  local company=$2
  local pic_name=$3
  local pic_wa=$4

  echo -e "${YELLOW}Test ${test_num}: ${company}${NC}"
  echo "  PIC: ${pic_name} | WA: ${pic_wa}"

  # Create payload
  local payload=$(create_test_payload "${company}" "${pic_name}" "${pic_wa}")

  # Send request
  local response=$(curl -s -X POST "${SCRIPT_URL}" \
    -H "Content-Type: application/json" \
    -d "${payload}" \
    --max-time 10 \
    -w "\n%{http_code}")

  # Extract HTTP code
  local http_code=$(echo "${response}" | tail -1)
  local body=$(echo "${response}" | sed '$d')

  # Check response
  if [[ "$http_code" == "302" ]]; then
    echo -e "  Status: ${GREEN}✓ SUCCESS (HTTP 302)${NC}"
    echo "  Response: Redirect received (expected for GAS)"
    echo "" >> "${RESULTS_FILE}"
    echo "Test ${test_num}: ${company}" >> "${RESULTS_FILE}"
    echo "  Status: SUCCESS (HTTP 302)" >> "${RESULTS_FILE}"
    echo "  Company: ${company}" >> "${RESULTS_FILE}"
    echo "  PIC: ${pic_name} | WA: ${pic_wa}" >> "${RESULTS_FILE}"
    echo "  Teams: 3 | Players: 15" >> "${RESULTS_FILE}"
    return 0
  else
    echo -e "  Status: ${RED}✗ FAILED (HTTP ${http_code})${NC}"
    echo "" >> "${RESULTS_FILE}"
    echo "Test ${test_num}: ${company}" >> "${RESULTS_FILE}"
    echo "  Status: FAILED (HTTP ${http_code})" >> "${RESULTS_FILE}"
    return 1
  fi
}

# Initialize results file
echo "MCC Registration Form Test Results" > "${RESULTS_FILE}"
echo "Timestamp: $(date)" >> "${RESULTS_FILE}"
echo "Endpoint: ${SCRIPT_URL}" >> "${RESULTS_FILE}"
echo "========================================================" >> "${RESULTS_FILE}"

# Run tests
PASS=0
FAIL=0

if run_test 1 "PT Bank Mandiri (Persero) Tbk" "Tigor Test" "6281234567890"; then ((PASS++)); else ((FAIL++)); fi
echo ""

if run_test 2 "PT Bank Danamon Indonesia Tbk" "Danamon Tester" "6282222222"; then ((PASS++)); else ((FAIL++)); fi
echo ""

if run_test 3 "PT Bank OCBC NISP" "OCBC Admin" "6283333333"; then ((PASS++)); else ((FAIL++)); fi
echo ""

if run_test 4 "PT Bank Permata Tbk" "Permata Test" "6284444444"; then ((PASS++)); else ((FAIL++)); fi
echo ""

if run_test 5 "PT Bank Syariah Indonesia Tbk" "BSI Tester" "6285555555"; then ((PASS++)); else ((FAIL++)); fi
echo ""

# Summary
echo -e "${BLUE}========================================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================================${NC}"
echo -e "Total Tests: $((PASS + FAIL))"
echo -e "Passed: ${GREEN}${PASS}${NC}"
echo -e "Failed: ${RED}${FAIL}${NC}"
echo ""

echo "" >> "${RESULTS_FILE}"
echo "========================================================" >> "${RESULTS_FILE}"
echo "Test Summary" >> "${RESULTS_FILE}"
echo "Total Tests: $((PASS + FAIL))" >> "${RESULTS_FILE}"
echo "Passed: ${PASS}" >> "${RESULTS_FILE}"
echo "Failed: ${FAIL}" >> "${RESULTS_FILE}"
echo "Timestamp: $(date)" >> "${RESULTS_FILE}"

# Final status
if [[ $FAIL -eq 0 ]]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  echo ""
  echo -e "${YELLOW}Next steps:${NC}"
  echo "1. Test in browser: http://localhost:8877/#register"
  echo "2. Fill form with test data"
  echo "3. Verify success page appears"
  echo "4. Check Google Sheet for data"
else
  echo -e "${RED}✗ Some tests failed. Check ${RESULTS_FILE} for details${NC}"
fi

echo ""
echo "Results saved to: ${RESULTS_FILE}"
echo ""

exit $FAIL
