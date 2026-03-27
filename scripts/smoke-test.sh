#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"

curl -fsS "$BASE_URL/api/health" >/dev/null

curl -fsS -X POST "$BASE_URL/api/leads" \
  -H 'content-type: application/json' \
  -d '{
    "name":"Smoke Test",
    "email":"smoke@example.com",
    "businessName":"Test Co",
    "serviceInterest":"Marketing website + lead capture",
    "goals":"Validate lead form persistence and notifications"
  }' >/dev/null

echo "Smoke test passed: health + lead submission"
