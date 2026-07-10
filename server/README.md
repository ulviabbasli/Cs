# CS 1.6 Web Server Stack

This folder is the VPS side of the browser CS setup.

Architecture:

```text
Browser WebXash client
  -> wss://YOUR_DOMAIN/websocket
  -> Caddy TLS reverse proxy
  -> Node WebSocket + UDP bridge
  -> HLDS Counter-Strike server on UDP 27015
```

Use this only on networks and computers where you have permission to play.

## 1. VPS requirements

- Ubuntu/Debian VPS
- Public IPv4 address
- A domain/subdomain pointing to the VPS, for example `cs.example.com`
- Docker and Docker Compose plugin. If missing, `scripts/deploy.sh` installs them on Ubuntu/Debian.
- Open inbound ports: `80/tcp`, `443/tcp`
- Optional for native CS clients/server browser: `27015/udp`

## 2. One-command deploy

On a fresh VPS:

```bash
git clone https://github.com/ulviabbasli/Cs.git
cd Cs/server
sudo bash scripts/deploy.sh cs.example.com admin@example.com
```

Replace:

- `cs.example.com` with the subdomain pointing to your VPS.
- `admin@example.com` with your email for Let's Encrypt notices.

The script:

- Installs Docker Engine and Compose plugin if missing.
- Creates `.env` with a random RCON password.
- Opens UFW ports if UFW is active.
- Validates Compose config.
- Builds and starts all containers.
- Runs bridge health checks.

## 3. Manual configure

On the VPS:

```bash
cd Cs/server
cp .env.example .env
nano .env
```

Set:

```env
DOMAIN=cs.example.com
ACME_EMAIL=you@example.com
SERVER_NAME=Office CS 1.6
RCON_PASSWORD=change-this
```

## 4. Start manually

```bash
docker compose up -d --build
docker compose logs -f
```

The first boot downloads/updates the HLDS Counter-Strike server through SteamCMD. If SteamCMD does not complete on the first try, the entrypoint retries automatically.

Health check:

```bash
curl https://cs.example.com/health
```

Expected result:

```json
{"ok":true,"udpHost":"cs-server","udpPort":27015}
```

## 5. Connect from GitHub Pages

Open the GitHub Pages client and enter only the domain:

```text
cs.example.com
```

Do not enter `https://`, `wss://`, or `/websocket`. The client builds the correct URL itself:

```text
wss://cs.example.com/websocket
```

## 6. If the game opens but stays black

That is client game-data, not server networking. The browser ZIP must contain a complete legal CS/Valve data set, including folders such as:

```text
cstrike/maps
cstrike/models
cstrike/sound
cstrike/sprites
valve/pak0.pak
```

Do not commit copyrighted game content to a public repository unless you have the right to distribute it.

## 7. Useful commands

```bash
make preflight
make up
make logs
make ps
make update
docker compose ps
docker compose logs -f bridge
docker compose logs -f cs-server
docker compose restart
docker compose down
```

## 8. Updating

```bash
cd Cs/server
sudo bash scripts/update.sh
```

## 9. Docker build verification

The repository includes `.github/workflows/docker-build.yml`. GitHub Actions validates the Compose file and builds both Docker images whenever `server/**` changes.
