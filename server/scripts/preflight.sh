#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

warn() {
  echo "WARN: $*" >&2
}

command -v docker >/dev/null 2>&1 || fail "Docker is not installed. Run: sudo bash scripts/deploy.sh YOUR_DOMAIN YOUR_EMAIL"
docker compose version >/dev/null 2>&1 || fail "Docker Compose plugin is not installed."

[[ -f "${ENV_FILE}" ]] || fail ".env file is missing. Copy .env.example or run deploy.sh."

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

[[ -n "${DOMAIN:-}" ]] || fail "DOMAIN is empty in .env"
[[ -n "${ACME_EMAIL:-}" ]] || fail "ACME_EMAIL is empty in .env"
[[ "${DOMAIN}" != "cs.example.com" ]] || warn "DOMAIN still uses the example value."
[[ "${ACME_EMAIL}" != "admin@example.com" ]] || warn "ACME_EMAIL still uses the example value."

echo "Docker:"
docker --version
docker compose version

echo
echo "Compose config:"
cd "${ROOT_DIR}"
docker compose config >/tmp/cs16-compose-config.yml
echo "OK: docker compose config is valid"

echo
echo "DNS check:"
if command -v getent >/dev/null 2>&1; then
  getent hosts "${DOMAIN}" || warn "DOMAIN does not resolve from this VPS yet: ${DOMAIN}"
else
  warn "getent not available; skipping DNS check"
fi

echo
echo "Port listener check:"
if command -v ss >/dev/null 2>&1; then
  ss -tulpn | grep -E ':(80|443)\b' || true
else
  warn "ss not available; skipping local port listener check"
fi

echo
echo "Preflight complete."
