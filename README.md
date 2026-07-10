# CS 1.6 Browser Client + VPS Server

Bu repo iki hisseden ibaretdir:

1. GitHub Pages uzerinden acilan browser klient.
2. `server/` qovlugunda VPS ucun CS 1.6 server + WebSocket bridge stack-i.

Istifade yalniz icazeli is muhitinde ve icazeli oyun/server fayllari ile nezerde tutulub.

## Arxitektura

```text
Is komputerindeki browser
  -> https://ulviabbasli.github.io/Cs/
  -> wss://YOUR_DOMAIN/websocket
  -> VPS Caddy TLS reverse proxy
  -> Node WebSocket + UDP bridge
  -> HLDS Counter-Strike server UDP 27015
```

GitHub Pages server prosesi isletmir. Ona gore GitHub yalniz HTML/JS/WASM klienti saxlayir. Real oyun serveri VPS-de Docker ile isleyir.

## VPS serveri hazirlamaq

VPS-de Docker ve Docker Compose plugin lazimdir.

```bash
git clone https://github.com/ulviabbasli/Cs.git
cd Cs/server
cp .env.example .env
nano .env
docker compose up -d --build
docker compose logs -f
```

`.env` faylinda bunlari deyis:

```env
DOMAIN=cs.example.com
ACME_EMAIL=you@example.com
SERVER_NAME=Office CS 1.6
RCON_PASSWORD=change-this
```

DNS-de `DOMAIN` VPS IP-sine yonelmelidir. Browser klient ucun firewall-da `80/tcp` ve `443/tcp` aciq olmalidir. Native CS klientler de qoslacaqsa `27015/udp` ac.

Health check:

```bash
curl https://cs.example.com/health
```

## Browserden qosulmaq

GitHub Pages sehifesini ac:

```text
https://ulviabbasli.github.io/Cs/
```

Multiplayer qutusuna yalniz domain yaz:

```text
cs.example.com
```

`https://`, `wss://`, `/websocket` yazsan da klient onu temizleyir.

## Qara ekran problemi

Engine acilib qara ekran qalirsa, bu adeten server problemi deyil. Browser ZIP fayli natamamdir.

Tam klient data-sinda en azi bunlar olmalidir:

```text
cstrike/liblist.gam
cstrike/maps
cstrike/models
cstrike/sound
cstrike/sprites
valve/pak0.pak
```

Public GitHub reposuna muellif huquqlu oyun fayllarini qoyma. Fayllari yalniz buna huququn varsa paylas.

ZIP-i hisselere bolmek ucun:

```powershell
.\tools\prepare-cstrike-parts.ps1 -ZipPath C:\path\to\cstrike_game.zip
```

Bu script `engine/cs/cstrike_game.part_*` fayllarini yaradir ve ZIP-in natamam olub-olmadigini xeberdar edir.

## Server fayllari

Daha detallı VPS telimati:

```text
server/README.md
```
