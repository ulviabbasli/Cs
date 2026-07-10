import { Xash3D as BaseXash3D, Net } from "./index-c3_R-ArA.js";

class Xash3DWebRTC extends BaseXash3D {
  constructor(options) {
    super(options);
    this.ws = null;
    this.multiplayerIP = options?.multiplayerIP;
    this.net = new Net(this);
  }

  async init() {
    await Promise.all([super.init(), this.connect()]);
  }

  connect() {
    return new Promise((resolve) => {
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const server = String(this.multiplayerIP || "").replace(/^(https?:\/\/|wss?:\/\/)/i, "").replace(/\/websocket\/?$/i, "").replace(/\/+$/, "");
      const url = `${proto}//${server}/websocket`;

      this.ws = new WebSocket(url);
      this.ws.binaryType = "arraybuffer";

      this.ws.onopen = () => resolve();
      this.ws.onmessage = (event) => {
        this.net.incoming.enqueue({
          ip: [127, 0, 0, 1],
          port: 27015,
          data: event.data,
        });
      };
      this.ws.onerror = () => {
        const errEl = document.getElementById("errorText");
        if (errEl) {
          errEl.textContent = `Servere qosulmaq alinmadi: ${url}`;
          const loader = document.getElementById("loader-screen");
          if (loader) loader.style.display = "block";
        } else {
          alert(`Failed to connect to ${url}`);
        }
        resolve();
      };
      this.ws.onclose = () => {
        console.warn("Game websocket closed");
      };
    });
  }

  sendto(packet) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(packet.data);
    }
  }
}

export { Xash3DWebRTC };
