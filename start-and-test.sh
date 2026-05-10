#!/bin/bash

# ============================================================
#  MCC Season 1 — Start Server & Run Tests
#  Usage: ./start-and-test.sh
# ============================================================

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================================${NC}"
echo -e "${BLUE}  MCC Registration — Complete Test Suite${NC}"
echo -e "${BLUE}========================================================${NC}"
echo ""

# Check if server is already running
if lsof -Pi :8877 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}ℹ Server already running on port 8877${NC}"
else
    echo -e "${YELLOW}Starting server on port 8877...${NC}"
    python3 -m http.server 8877 --directory . > /tmp/mcc-server.log 2>&1 &
    SERVER_PID=$!
    sleep 2
    echo -e "${GREEN}✓ Server started (PID: ${SERVER_PID})${NC}"
fi

echo ""
echo -e "${BLUE}========================================================${NC}"
echo -e "${BLUE}  Running API Tests${NC}"
echo -e "${BLUE}========================================================${NC}"
echo ""

# Run the test script
./test-registration.sh

echo ""
echo -e "${BLUE}========================================================${NC}"
echo -e "${BLUE}  Next: Browser Testing${NC}"
echo -e "${BLUE}========================================================${NC}"
echo ""
echo -e "${YELLOW}Manual browser test checklist:${NC}"
echo ""
echo "1. Open browser: ${GREEN}http://localhost:8877${NC}"
echo ""
echo "2. Navigate to #register and fill form:"
echo "   Step 1: Select company + PIC info"
echo "   Step 2-4: Fill teams (3 teams, 5+ players each)"
echo "   Step 5: Confirm + Accept terms"
echo "   Click: 'Daftar Sekarang'"
echo ""
echo "3. Verify:"
echo "   ✓ Success page shows: '${GREEN}Pendaftaran Berhasil! 🎉${NC}'"
echo "   ✓ Data appears in Google Sheet"
echo ""
echo "4. When done, check results:"
echo "   - View latest: ${GREEN}cat test-results-*.txt${NC}"
echo ""
