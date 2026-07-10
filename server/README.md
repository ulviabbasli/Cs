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
- Docker and Docker Compose plugin installed
- Open inbound ports: `80/tcp`, `443/tcp`
- Optional for native CS clients/server browser: `27015/udp`

## 2. Configure

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

## 3. Start

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

## 4. Connect from GitHub Pages

Open the GitHub Pages client and enter only the domain:

```text
cs.example.com
```

Do not enter `https://`, `wss://`, or `/websocket`. The client builds the correct URL itself:

```text
wss://cs.example.com/websocket
```

## 5. If the game opens but stays black

That is client game-data, not server networking. The browser ZIP must contain a complete legal CS/Valve data set, including folders such as:

```text
cstrike/maps
cstrike/models
cstrike/sound
cstrike/sprites
valve/pak0.pak
```

Do not commit copyrighted game content to a public repository unless you have the right to distribute it.

## 6. Useful commands

```bash
docker compose ps
docker compose logs -f bridge
docker compose logs -f cs-server
docker compose restart
docker compose down
```
