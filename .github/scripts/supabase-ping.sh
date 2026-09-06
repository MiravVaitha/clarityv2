#!/usr/bin/env bash
#
# The keepalive itself: open a real Postgres connection and read a real table so
# Supabase's 7-day inactivity timer resets.
#
# This deliberately does NOT go through /api/keepalive. That route works — a
# manual rerun from the Vercel dashboard reliably buys another week — but it can
# only run when Vercel's scheduler actually fires, which is the part that keeps
# failing. Connecting straight to Postgres also means the keepalive no longer
# depends on the deployment being healthy.

set -uo pipefail

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "SUPABASE_DB_URL is not set. Add it as a repository secret under" >&2
  echo "Settings -> Secrets and variables -> Actions." >&2
  exit 1
fi

# Preinstalled on ubuntu-latest today; this is insurance against a runner image
# change, not something that normally runs.
if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found on the runner — installing postgresql-client."
  sudo apt-get update -qq && sudo apt-get install -y -qq postgresql-client
fi

# count(*) is valid on an empty table, so this never depends on there being rows.
# Reading a real table rather than `select 1` means a dropped or renamed table
# fails loudly instead of passing forever. Table names in this project are
# lowercase, so the identifier needs no quoting.
QUERY='select count(*) from sessions'

ATTEMPTS=3
BACKOFF=(2 8)

# A hung connection must not eat the job's 5-minute budget.
export PGCONNECT_TIMEOUT=15
export PGOPTIONS='-c statement_timeout=15000'

# Supabase refuses unencrypted connections, and psql's default (sslmode=prefer)
# would silently fall back to plaintext against a server that allowed it. Set
# here rather than asking whoever pastes the secret to hand-append
# `?sslmode=require` — an explicit sslmode in the URI still wins over this.
export PGSSLMODE="${PGSSLMODE:-require}"

for attempt in $(seq 1 "$ATTEMPTS"); do
  if out=$(psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -Atqc "$QUERY" 2>&1); then
    echo "OK (attempt ${attempt}) — sessions holds ${out} row(s)."
    exit 0
  fi

  # psql's message only. It can name the host but never the password, and the
  # connection string itself must not reach a public build log.
  echo "Attempt ${attempt}/${ATTEMPTS} failed: ${out}" >&2

  case "$out" in
    *"Network is unreachable"*|*"could not translate host name"*|*"No route to host"*)
      echo "Hint: GitHub runners are IPv4-only, and Supabase's direct connection" >&2
      echo "(db.<ref>.supabase.co) is IPv6-only without the paid IPv4 add-on." >&2
      echo "Use the Session pooler URI from Supabase -> Connect instead:" >&2
      echo "  postgresql://postgres.<ref>:<password>@aws-N-<region>.pooler.supabase.com:5432/postgres" >&2
      ;;
    *"password authentication failed"*|*"SASL"*)
      echo "Hint: if the database password contains @ : / ? # or %, it has to be" >&2
      echo "percent-encoded inside the URI (@ -> %40, # -> %23, and so on)." >&2
      ;;
  esac

  wait_s=${BACKOFF[$((attempt - 1))]:-}
  if [ -n "$wait_s" ]; then sleep "$wait_s"; fi
done

echo "All attempts failed — Supabase was not reached, so the pause timer did not reset." >&2
exit 1
