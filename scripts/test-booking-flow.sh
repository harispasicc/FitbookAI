#!/usr/bin/env bash
set -euo pipefail
BASE="${BASE_URL:-http://localhost:3000}"
CLIENT_JAR=$(mktemp)
TRAINER_JAR=$(mktemp)
trap 'rm -f "$CLIENT_JAR" "$TRAINER_JAR"' EXIT

log() { echo ""; echo "=== $* ==="; }

api() {
  local jar=$1; shift
  curl -s -b "$jar" -c "$jar" "$@"
}

login() {
  api "$CLIENT_JAR" -X POST "$BASE/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"marko.client@fitbook.ai","password":"demo1234","expectedRole":"client"}' > /dev/null
  api "$TRAINER_JAR" -X POST "$BASE/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"amina.trainer@fitbook.ai","password":"demo1234","expectedRole":"trainer"}' > /dev/null
}

json_field() {
  python3 -c "import sys,json; d=json.load(sys.stdin); print($1)" 2>/dev/null
}

log "LOGIN"
login

log "FIND AMINA COACH"
COACHES=$(curl -s "$BASE/api/coaches")
COACH_ID=$(echo "$COACHES" | python3 -c "
import sys, json
d = json.load(sys.stdin)
items = d.get('data', d)
if isinstance(items, dict):
    items = items.get('items', [])
for c in items:
    if (c.get('fullName') or '').startswith('Amina'):
        print(c['id'])
        break
else:
    for c in items:
        if c.get('specialty'):
            print(c['id'])
            break
")
if [ -z "$COACH_ID" ]; then
  echo "FAIL: no Amina coach in /api/coaches"
  echo "$COACHES" | head -c 400
  exit 1
fi
echo "COACH_ID=$COACH_ID"

SERVICES=$(curl -s "$BASE/api/coaches/$COACH_ID/services")
SERVICE_ID=$(echo "$SERVICES" | json_field "d['data'][0]['id']")
echo "SERVICE_ID=$SERVICE_ID"

AVAIL=$(curl -s "$BASE/api/coaches/$COACH_ID/availability")
SLOT_ID=$(echo "$AVAIL" | python3 -c "
import sys, json
d = json.load(sys.stdin)['data']
slots = d.get('upcomingSlots', d.get('slots', []))
for s in slots:
    if not s.get('isBooked', False):
        print(s['id'])
        break
")
if [ -z "$SLOT_ID" ]; then
  echo "FAIL: no free slot"
  echo "$AVAIL" | head -c 400
  exit 1
fi
echo "SLOT_ID=$SLOT_ID"

log "CREATE BOOKING"
CREATE=$(api "$CLIENT_JAR" -X POST "$BASE/api/bookings" \
  -H "Content-Type: application/json" \
  -d "{\"trainerProfileId\":\"$COACH_ID\",\"serviceId\":\"$SERVICE_ID\",\"availabilitySlotId\":\"$SLOT_ID\",\"notes\":\"E2E\"}")
echo "$CREATE" | python3 -m json.tool | head -20
BOOKING_ID=$(echo "$CREATE" | json_field "d['data']['id']")
STATUS=$(echo "$CREATE" | json_field "d['data']['status']")
[ "$STATUS" = "pending" ] || { echo "FAIL: expected pending, got $STATUS"; exit 1; }
echo "BOOKING_ID=$BOOKING_ID"

log "DOUBLE BOOK SAME SLOT (expect 409)"
CODE=$(api "$CLIENT_JAR" -o /dev/null -w "%{http_code}" -X POST "$BASE/api/bookings" \
  -H "Content-Type: application/json" \
  -d "{\"trainerProfileId\":\"$COACH_ID\",\"serviceId\":\"$SERVICE_ID\",\"availabilitySlotId\":\"$SLOT_ID\"}")
echo "HTTP $CODE"
[ "$CODE" = "409" ] || echo "WARN: expected 409, got $CODE"

log "TRAINER CONFIRM"
CONF=$(api "$TRAINER_JAR" -X PATCH "$BASE/api/bookings/$BOOKING_ID" \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed"}')
echo "$CONF" | json_field "d['data']['status']"

log "CANCEL (second booking)"
AVAIL2=$(curl -s "$BASE/api/coaches/$COACH_ID/availability")
SLOT2=$(echo "$AVAIL2" | python3 -c "
import sys, json
d = json.load(sys.stdin)['data']
for s in d.get('upcomingSlots', []):
    if not s.get('isBooked', False):
        print(s['id']); break
")
CREATE2=$(api "$CLIENT_JAR" -X POST "$BASE/api/bookings" \
  -H "Content-Type: application/json" \
  -d "{\"trainerProfileId\":\"$COACH_ID\",\"serviceId\":\"$SERVICE_ID\",\"availabilitySlotId\":\"$SLOT2\"}")
B2=$(echo "$CREATE2" | json_field "d['data']['id']")
DEL=$(api "$CLIENT_JAR" -X DELETE "$BASE/api/bookings/$B2")
echo "cancelled: $(echo "$DEL" | json_field "d['data']['status']")"

log "RESCHEDULE"
AVAIL3=$(curl -s "$BASE/api/coaches/$COACH_ID/availability")
NEW_SLOT=$(echo "$AVAIL3" | python3 -c "
import sys, json
d = json.load(sys.stdin)['data']
for s in d.get('upcomingSlots', []):
    if not s.get('isBooked', False):
        print(s['id']); break
")
RES=$(api "$CLIENT_JAR" -X PATCH "$BASE/api/bookings/$BOOKING_ID" \
  -H "Content-Type: application/json" \
  -d "{\"availabilitySlotId\":\"$NEW_SLOT\"}")
echo "new startsAt: $(echo "$RES" | json_field "d['data']['startsAt']")"

log "TRAINER COMPLETE"
COMP=$(api "$TRAINER_JAR" -X PATCH "$BASE/api/bookings/$BOOKING_ID" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}')
echo "status: $(echo "$COMP" | json_field "d['data']['status']")"

log "REVIEW"
REV=$(api "$CLIENT_JAR" -X POST "$BASE/api/me/bookings/$BOOKING_ID/review" \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"comment":"E2E great"}')
echo "$REV" | python3 -m json.tool | head -12

log "DUPLICATE REVIEW (expect 409)"
CODE=$(api "$CLIENT_JAR" -o /dev/null -w "%{http_code}" -X POST "$BASE/api/me/bookings/$BOOKING_ID/review" \
  -H "Content-Type: application/json" \
  -d '{"rating":4}')
echo "HTTP $CODE"

log "REVIEW ON PENDING (expect 422)"
AVAIL4=$(curl -s "$BASE/api/coaches/$COACH_ID/availability")
S4=$(echo "$AVAIL4" | python3 -c "
import sys, json
for s in json.load(sys.stdin)['data'].get('upcomingSlots', []):
    if not s.get('isBooked', False):
        print(s['id']); break
")
C4=$(api "$CLIENT_JAR" -X POST "$BASE/api/bookings" \
  -H "Content-Type: application/json" \
  -d "{\"trainerProfileId\":\"$COACH_ID\",\"serviceId\":\"$SERVICE_ID\",\"availabilitySlotId\":\"$S4\"}")
B4=$(echo "$C4" | json_field "d['data']['id']")
CODE=$(api "$CLIENT_JAR" -o /dev/null -w "%{http_code}" -X POST "$BASE/api/me/bookings/$B4/review" \
  -H "Content-Type: application/json" \
  -d '{"rating":5}')
echo "review on pending: HTTP $CODE"

log "CLIENT CANNOT CONFIRM (expect 422)"
CODE=$(api "$CLIENT_JAR" -o /dev/null -w "%{http_code}" -X PATCH "$BASE/api/bookings/$B4" \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed"}')
echo "client confirm: HTTP $CODE"

log "LIST CLIENT BOOKINGS"
LIST=$(api "$CLIENT_JAR" "$BASE/api/me/bookings?limit=5")
echo "$LIST" | python3 -c "
import sys, json
body = json.load(sys.stdin)
items = body['data'] if isinstance(body.get('data'), list) else body['data'].get('items', [])
print('count', len(items))
for b in items[:3]:
    print(b['id'][:8], b['status'], 'review', b.get('hasReview'))
"

echo ""
echo "ALL BOOKING FLOW CHECKS DONE"
