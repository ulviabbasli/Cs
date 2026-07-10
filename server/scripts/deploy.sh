#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOMAIN_ARG="${1:-}"
EMAIL_ARG="${2:-}"

usage() {
  cat <<'USAGE'
Usage:
  sudo bash scripts/deploy.sh DOMAIN EMAIL

Example:
  sudo bash scripts/deploy.sh cs.example.com admin@example.com

This script is intended for a fresh Ubuntu/Debian VPS. It installs Docker
when missing, writes .env, builds the CS stack, starts it, and runs a health check.
USAGE
}

if [[ -z "${DOMAIN_ARG}" || -z "${EMAIL_ARG}" ]]; then
  usage
  exit 1
fi

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "ERROR: deploy.sh must run on the Linux VPS, not on Windows." >&2
  exit 1
fi

if [[ "${EUID}" -ne 0 ]]; then
  echo "ERROR: run with sudo/root because Docker installation and port binding need privileges." >&2
  exit 1
fi

install_docker() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    echo "Docker and Compose already installed."
    return
  fi

  if ! command -v apt-get >/dev/null 2>&1; then
    echo "ERROR: automatic Docker install supports Debian/Ubuntu apt-based systems only." >&2
    exit 1
  fi

  echo "Installing Docker Engine and Compose plugin..."
  apt-get update
  apt-get install -y ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings

  # shellcheck disable=SC1091
  . /etc/os-release
  local docker_id="${ID}"
  local docker_codename="${VERSION_CODENAME:-${UBUNTU_CODENAME:-}}"
  if [[ "${docker_id}" != "ubuntu" && "${docker_id}" != "debian" ]]; then
    echo "ERROR: automatic Docker install supports Ubuntu/Debian only. Detected: ${docker_id}" >&2
    exit 1
  fi
  if [[ -z "${docker_codename}" ]]; then
    echo "ERROR: could not detect OS codename from /etc/os-release." >&2
    exit 1
  fi

  curl -fsSL "https://download.docker.com/linux/${docker_id}/gpg" -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc

  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/${docker_id} ${docker_codename} stable" \
    > /etc/apt/sources.list.d/docker.list

  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  if command -v systemctl >/dev/null 2>&1; then
    systemctl enable --now docker
  else
    service docker start
  fi
}

random_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 16
  else
    od -An -N16 -tx1 /dev/urandom | tr -d ' \n'
  fi
}

write_env() {
  local env_file="${ROOT_DIR}/.env"
  if [[ -f "${env_file}" ]]; then
    echo ".env already exists; keeping it. DOMAIN/ACME_EMAIL from existing file will be used by Compose."
    return
  fi

  local rcon
  rcon="$(random_secret)"
  cat > "${env_file}" <<EOF_ENV
DOMAIN=${DOMAIN_ARG}
ACME_EMAIL=${EMAIL_ARG}
SERVER_NAME=Office CS 1.6
START_MAP=de_dust2
MAXPLAYERS=16
RCON_PASSWORD=${rcon}
HLDS_PORT=27015
BRIDGE_PORT=27016
EOF_ENV

  chmod 600 "${env_file}"
  echo "Created ${env_file}"
}

open_ufw_ports_if_needed() {
  if command -v ufw >/dev/null 2>&1 && ufw status | grep -qi "Status: active"; then
    echo "UFW is active; allowing 80/tcp, 443/tcp, and 27015/udp..."
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 27015/udp
  fi
}

install_docker
write_env
open_ufw_ports_if_needed

cd "${ROOT_DIR}"

echo "Running preflight..."
bash scripts/preflight.sh

set -a
# shellcheck disable=SC1091
source "${ROOT_DIR}/.env"
set +a
DEPLOY_DOMAIN="${DOMAIN:-${DOMAIN_ARG}}"

echo "Building and starting stack..."
docker compose up -d --build

echo "Current containers:"
docker compose ps

echo "Waiting for bridge health..."
for attempt in $(seq 1 30); do
  if docker compose exec -T bridge node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT || 27016) + '/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"; then
    echo "Bridge is healthy."
    break
  fi
  if [[ "${attempt}" -eq 30 ]]; then
    echo "ERROR: bridge did not become healthy. Logs:" >&2
    docker compose logs --tail=100 bridge >&2
    exit 1
  fi
  sleep 2
done

echo
echo "Done."
echo "Health URL: https://${DEPLOY_DOMAIN}/health"
echo "Browser client server value: ${DEPLOY_DOMAIN}"
echo
echo "Useful logs:"
echo "  docker compose logs -f bridge"
echo "  docker compose logs -f cs-server"
