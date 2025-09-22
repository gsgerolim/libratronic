import { AppConn } from "./appcon.js";

const btnScan = document.getElementById("btnScan");
const wifiListBox = document.getElementById("wifiList");
const ssidInput = document.getElementById("ssid");
const wifiForm = document.getElementById("wifiForm");

// Atualiza a lista de redes no HTML
function updateWifiList(redes) {
  wifiListBox.innerHTML = "<b>Redes encontradas:</b><br>";
  const select = document.createElement("select");
  select.className = "input";

  redes.forEach(r => {
    const option = document.createElement("option");
    option.value = r.ssid;
    option.textContent = `${r.ssid} ${r.open ? "(aberta)" : ""} | RSSI: ${r.rssi}`;
    select.appendChild(option);
  });

  select.addEventListener("change", () => ssidInput.value = select.value);
  wifiListBox.appendChild(select);

  wifiForm.style.display = "flex";
  ssidInput.value = redes[0]?.ssid || "";
}

// Recebe mensagens do WebSocket
AppConn.addListener(msg => {
  if(msg.type === 'log'){
    AppConn.logStatus(msg.message);
  } else if(msg.type === 'scan'){
    updateWifiList(msg.redes);
    AppConn.logStatus(`Scan finalizado: ${msg.redes.length} redes encontradas`);
  }
});

// Botão "Listar redes WiFi"
btnScan.addEventListener("click", async () => {
  AppConn.logStatus("Iniciando scan...");
  try {
    // Conecta ao WebSocket
    await AppConn.connect(document.getElementById("espHost").value);

    // envia comando de scan
    AppConn.sendWS({ cmd: "start_scan" });

  } catch(e) {
    AppConn.logStatus("Falha ao iniciar scan: " + e.message);
  }
});
