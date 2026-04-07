#!/usr/bin/env bash
# =============================================================
# e-Hotels — full database setup script (cross-platform)
# Usage: bash sql/setup.sh
#
# Works on macOS, Linux, and Windows (Git Bash / WSL).
# Requires PostgreSQL client tools (psql) to be installed.
# =============================================================

set -e

# ── Locate psql ───────────────────────────────────────────────
if command -v psql &>/dev/null; then
  PSQL="psql"
elif [ -f "/c/Program Files/PostgreSQL/18/bin/psql.exe" ]; then
  PSQL="/c/Program Files/PostgreSQL/18/bin/psql.exe"
elif [ -f "/c/Program Files/PostgreSQL/17/bin/psql.exe" ]; then
  PSQL="/c/Program Files/PostgreSQL/17/bin/psql.exe"
else
  echo "Error: psql not found. Install PostgreSQL or add it to your PATH."
  exit 1
fi

# ── Configuration (override via env vars if needed) ──────────
PG_USER="${PG_USER:-postgres}"
PG_HOST="${PG_HOST:-localhost}"
PG_PORT="${PG_PORT:-5432}"
DB_NAME="${DB_NAME:-ehotels}"

# Prompt for password if not already set
if [ -z "$PG_PASSWORD" ]; then
  read -r -s -p "Enter PostgreSQL password for user '$PG_USER': " PG_PASSWORD
  echo
fi

if [ -z "$PG_PASSWORD" ]; then
  echo "Error: Password cannot be empty."
  exit 1
fi

export PGPASSWORD="$PG_PASSWORD"

SQL_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── Helper ────────────────────────────────────────────────────
run_sql() {
  echo "  -> $(basename "$1") ..."
  "$PSQL" -U "$PG_USER" -h "$PG_HOST" -p "$PG_PORT" -d "$DB_NAME" -f "$1"
}

# ── 1. Create database ────────────────────────────────────────
echo ""
echo "=== Step 1: Creating database '$DB_NAME' (if needed) ==="
"$PSQL" -U "$PG_USER" -h "$PG_HOST" -p "$PG_PORT" -d postgres \
  -c "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME';" \
  | grep -q 1 \
  || "$PSQL" -U "$PG_USER" -h "$PG_HOST" -p "$PG_PORT" -d postgres \
     -c "CREATE DATABASE $DB_NAME;"
echo "  -> '$DB_NAME' is ready."

# ── 2–7. SQL files ────────────────────────────────────────────
echo ""; echo "=== Step 2: Applying schema ==="
run_sql "$SQL_DIR/schema.sql"

echo ""; echo "=== Step 3: Creating triggers ==="
run_sql "$SQL_DIR/triggers.sql"

echo ""; echo "=== Step 4: Creating views ==="
run_sql "$SQL_DIR/views.sql"

echo ""; echo "=== Step 5: Creating indexes ==="
run_sql "$SQL_DIR/indexes.sql"

echo ""; echo "=== Step 6: Populating data ==="
run_sql "$SQL_DIR/populate.sql"

echo ""; echo "=== Step 7: Adding auth (email + password) ==="
run_sql "$SQL_DIR/add_auth.sql"

# ── 8. Write .env.local ───────────────────────────────────────
ENV_FILE="$SQL_DIR/../.env.local"
DATABASE_URL="postgresql://$PG_USER:$PG_PASSWORD@$PG_HOST:$PG_PORT/$DB_NAME"

if [ ! -f "$ENV_FILE" ]; then
  echo "DATABASE_URL=$DATABASE_URL" > "$ENV_FILE"
  echo ""; echo "  -> Created .env.local"
else
  echo ""; echo "  -> .env.local already exists — skipping (delete it and re-run if you need to reset it)"
fi

# ── Done ──────────────────────────────────────────────────────
echo ""
echo "============================================="
echo " Setup complete!"
echo " Database : $DB_NAME @ $PG_HOST:$PG_PORT"
echo ""
echo " Customer logins:  alice1@email.com / password123"
echo "                   brian2@email.com / password123"
echo "                   (pattern: firstnamelowercase + customerid + @email.com)"
echo ""
echo " Employee logins:  james1@ehotels.com / password123"
echo "                   patricia2@ehotels.com / password123"
echo "                   (pattern: firstnamelowercase + employeeid + @ehotels.com)"
echo ""
echo " Next step: npm install && npm run dev"
echo "============================================="
