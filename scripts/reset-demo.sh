#!/usr/bin/env bash
# Resets FitBook demo users, availability slots, and related data (no bookings).
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -z "${DATABASE_URL:-}" ]; then
  if [ -f .env ]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
  else
    echo "Error: DATABASE_URL not set. Add it to .env or export it."
    exit 1
  fi
fi

echo "Resetting FitBook demo data (seed)…"
npx prisma db seed
echo ""
echo "Demo accounts (password: demo1234):"
echo "  Client:  marko.client@fitbook.ai"
echo "  Trainer: amina.trainer@fitbook.ai"
echo ""
echo "All availability slots are unbooked — ready for the booking wizard."
