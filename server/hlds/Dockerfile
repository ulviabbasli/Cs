FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN dpkg --add-architecture i386 \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
      ca-certificates \
      curl \
      libc6-i386 \
      lib32gcc-s1 \
      libstdc++6:i386 \
      tini \
    && mkdir -p /opt/steamcmd \
    && curl -fsSL https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz \
      | tar -xzf - -C /opt/steamcmd \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/hlds

ENV STEAMCMD_BIN=/opt/steamcmd/steamcmd.sh

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 27015/udp

ENTRYPOINT ["tini", "--", "/entrypoint.sh"]
