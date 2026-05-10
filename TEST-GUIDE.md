# MCC Registration Form — Test Guide

## Quick Start

### 1. Run API Tests (Recommended First)
```bash
./test-registration.sh
```
This sends 5 test submissions to the GAS endpoint and verifies HTTP responses.

**Output:** 
- ✅ Success (HTTP 302) = GAS endpoint working
- Results saved to `test-results-TIMESTAMP.txt`

---

## Available Test Scripts

### `test-registration.sh` — API Tests
Send automated test submissions to GAS endpoint.

```bash
./test-registration.sh
```

**What it does:**
- Creates test payloads for 5 companies
- Sends POST requests to GAS endpoint
- Verifies HTTP 302 response
- Saves results to timestamped file

**Sample output:**
```
Test 1: PT Bank Mandiri (Persero) Tbk
  Status: ✓ SUCCESS (HTTP 302)
Test 2: PT Bank Danamon Indonesia Tbk
  Status: ✓ SUCCESS (HTTP 302)
...
Total Tests: 5
Passed: 5
Failed: 0
```

---

### `start-and-test.sh` — Full Test Workflow
Starts server + runs API tests + shows browser testing guide.

```bash
./start-and-test.sh
```

**What it does:**
1. Checks if server already running
2. Starts HTTP server on port 8877 if needed
3. Runs `test-registration.sh`
4. Displays browser testing checklist

---

### `test-utils.sh` — Utility Commands
Helper commands for server management and test results.

```bash
./test-utils.sh [command]
```

**Available commands:**

| Command | Description |
|---------|-------------|
| `status` | Check server + GAS endpoint + latest results |
| `start` | Start HTTP server on port 8877 |
| `stop` | Stop HTTP server |
| `run-tests` | Run API tests (alias for test-registration.sh) |
| `latest-results` | Display latest test results |
| `open-register` | Open register form in browser |
| `logs` | Show server logs |
| `clean` | Delete all test result files |

**Examples:**
```bash
./test-utils.sh status        # Check everything
./test-utils.sh start         # Start server
./test-utils.sh run-tests     # Run tests
./test-utils.sh results       # Show latest results
```

---

## Complete Testing Workflow

### Step 1: Start Server (One-time)
```bash
./test-utils.sh start
```
Or auto-start with:
```bash
./start-and-test.sh
```

### Step 2: Run API Tests
```bash
./test-registration.sh
```
Expected output: **All 5 tests pass** ✅

### Step 3: Browser Testing
1. Open: http://localhost:8877/#register
2. Fill form completely:
   - Step 1: Company + PIC info
   - Steps 2-4: Teams (3 teams, 5+ players each)
   - Step 5: Accept terms
3. Click "Daftar Sekarang"
4. Verify:
   - ✅ Success page: "Pendaftaran Berhasil! 🎉"
   - ✅ Data in Google Sheet

### Step 4: Check Results
```bash
./test-utils.sh latest-results
```

---

## Test Data

### Companies in Test (from members.json)
- PT Bank Mandiri (Persero) Tbk
- PT Bank Danamon Indonesia Tbk
- PT Bank OCBC NISP
- PT Bank Permata Tbk
- PT Bank Syariah Indonesia Tbk

### Sample Submission Structure
Each test sends:
- **Company:** Test company name
- **PIC:** Contact person info
- **Teams:** 3 teams (Team A, B, C)
- **Players:** 5 players per team (15 total)
- **Files:** null (optional in tests)

---

## Troubleshooting

### "Server already running"
Server detected on port 8877. No need to restart.

### "GAS endpoint issue"
- Check SCRIPT_URL in `assets/js/pages/register.js`
- Verify GAS script is deployed as Web App
- Check network connectivity

### "No test results found"
Run tests first:
```bash
./test-registration.sh
```

### View Server Logs
```bash
./test-utils.sh logs
```

---

## Files Created During Testing

| File | Description |
|------|-------------|
| `test-results-TIMESTAMP.txt` | API test results |
| `/tmp/mcc-server.log` | HTTP server logs |

To clean up:
```bash
./test-utils.sh clean
```

---

## Manual Form Testing Checklist

### Step 1: Company Information
- [ ] Navigate to #register
- [ ] Company dropdown shows all 13 companies
- [ ] Enter PIC name
- [ ] Enter WhatsApp number
- [ ] (Optional) Upload document
- [ ] Click "Lanjut"

### Steps 2-4: Team Information (for each team)
- [ ] Enter team name
- [ ] Enter captain name
- [ ] Enter captain WhatsApp
- [ ] (Optional) Upload logo
- [ ] Add 5 players minimum
  - [ ] Player name
  - [ ] Game ID
  - [ ] Game nick
- [ ] "Tambah Pemain" button works
- [ ] "Hapus" button removes player
- [ ] Click "Lanjut"

### Step 5: Confirmation
- [ ] All data displays correctly
- [ ] Check "Saya menyatakan..."
- [ ] Check "Saya setuju..."
- [ ] Click "Daftar Sekarang"

### Success
- [ ] Loading spinner appears
- [ ] Success page: "Pendaftaran Berhasil! 🎉"
- [ ] "Kembali ke Beranda" button works
- [ ] Data in Google Sheet:
  - [ ] Timestamp recorded
  - [ ] Company name correct
  - [ ] PIC info saved
  - [ ] Teams JSON formatted correctly

---

## GAS Script Info

**Endpoint:** `https://script.google.com/macros/s/AKfycbxHdzThlarsyCeUlf6wQJz4Ipq_z9I-VeAS1wwB8WGs97I31afoBsODZaVe-Eh5Obh-/exec`

**Expected Response:** HTTP 302 (Google Apps Script redirect)

**Data Storage:** Google Sheets (auto-created "Registrasi" sheet)

---

## Notes

- All scripts are self-contained and can be run independently
- Server runs on **port 8877** (configured in `startweb.sh`)
- Test results include timestamp for tracking
- GAS endpoint uses HTTP 302 redirects (normal behavior)
- Form validation prevents submission without required fields

---

Last Updated: 2026-05-10
