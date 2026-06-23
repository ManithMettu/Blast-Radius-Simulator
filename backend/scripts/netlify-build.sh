#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set."
  echo "Add it in Netlify: Site settings → Environment variables"
  echo "Enable scopes: Builds and Functions"
  echo "Example:"
  echo '  postgres://USER:PASSWORD@HOST:PORT/defaultdb?sslmode=require'
  exit 1
fi

# Strip accidental wrapping quotes / whitespace from Netlify UI input.
DATABASE_URL="$(printf '%s' "$DATABASE_URL" | sed -e 's/^[[:space:]"'"'"']*//' -e 's/[[:space:]"'"'"']*$//')"
export DATABASE_URL

if [[ ! "$DATABASE_URL" =~ ^postgres(ql)?:// ]]; then
  echo "ERROR: DATABASE_URL must start with postgres:// or postgresql://"
  echo "Got: ${DATABASE_URL:0:40}..."
  echo "In Netlify, paste the full URL with no surrounding quotes."
  exit 1
fi

npm ci --include=dev
npx prisma generate
npm run build
npx prisma migrate deploy
