import { AppConn } from "./appcon.js";

const icon = document.getElementById("wifiIcon");
const card = document.getElementById("connectionCard");

let wifiState = "disconnected"; // disconnected, connecting, connected, failed

// Atualiza o estado visual do ícone
function updateIcon(state) {
  icon.className = `wifi-icon ${state}`;
  wifiState = state;
}

// Toggle card ao clicar
icon.addEventListener("click", () => {
  card.style.display = card.style.display === "none" ? "block" : "none";
});

// Observa conexão e atualiza ícone
async function checkStatus() {
  try {
    updateIcon("connecting");
    const res = await AppConn.apiGet("/api/status");
    if (res.wifi_connected) {
      updateIcon("connected");
      enableFeatures();
    } else {
      updateIcon("disconnected");
    }
  } catch (e) {
    updateIcon("failed");
  }
}

// Chama a cada 5s
setInterval(checkStatus, 5000);
checkStatus();

// Função para habilitar botões do corpo
function enableFeatures() {
  const buttons = document.querySelectorAll(".feature-btn");
  buttons.forEach(btn => {
    btn.disabled = false;
    btn.classList.add("enabled");
  });
}
