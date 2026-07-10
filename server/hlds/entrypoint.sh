#!/usr/bin/env bash
set -euo pipefail

HLDS_DIR="/opt/hlds"
STEAMCMD_BIN="${STEAMCMD_BIN:-/usr/games/steamcmd}"
SERVER_NAME="${SERVER_NAME:-Office CS 1.6}"
START_MAP="${START_MAP:-de_dust2}"
MAXPLAYERS="${MAXPLAYERS:-16}"
RCON_PASSWORD="${RCON_PASSWORD:-change-this-rcon-password}"
SERVER_PORT="${SERVER_PORT:-27015}"

install_hlds() {
  echo "Installing/updating HLDS Counter-Strike 1.6 files with SteamCMD..."
  for attempt in 1 2 3 4 5; do
    "${STEAMCMD_BIN}" \
      +force_install_dir "${HLDS_DIR}" \
      +login anonymous \
      +app_set_config 90 mod cstrike \
      +app_update 90 validate \
      +quit || true

    if [[ -x "${HLDS_DIR}/hlds_run" && -d "${HLDS_DIR}/cstrike" ]]; then
      return 0
    fi

    echo "HLDS install attempt ${attempt} did not finish cleanly; retrying..."
    sleep 5
  done

  echo "ERROR: HLDS files were not installed. You can also mount a legal existing HLDS/cstrike folder into server/hlds-data."
  exit 1
}

if [[ ! -x "${HLDS_DIR}/hlds_run" || ! -d "${HLDS_DIR}/cstrike" ]]; then
  install_hlds
fi

mkdir -p "${HLDS_DIR}/cstrike"
cat > "${HLDS_DIR}/cstrike/server.cfg" <<EOF_CFG
hostname "${SERVER_NAME}"
rcon_password "${RCON_PASSWORD}"
sv_lan 0
mp_autoteambalance 1
mp_limitteams 2
mp_freezetime 3
mp_roundtime 3
mp_startmoney 800
sv_voiceenable 1
EOF_CFG

cd "${HLDS_DIR}"
exec ./hlds_run \
  -game cstrike \
  -console \
  -insecure \
  +ip 0.0.0.0 \
  +port "${SERVER_PORT}" \
  +maxplayers "${MAXPLAYERS}" \
  +map "${START_MAP}"
