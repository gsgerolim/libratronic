import { AppConn } from "./appcon.js";
import { renderLetters } from "./letters.js";

const btnLetras = document.getElementById("btnLetras");
const btnFrases = document.getElementById("btnFrases");
const btnAudio = document.getElementById("btnAudio");

const connectionSection = document.getElementById("connectionSection");
const lettersSection = document.getElementById("lettersSection");
const phrasesSection = document.getElementById("phrasesSection");

const btnBackToMain = document.getElementById("btnBackToMain");
const btnBackFromPhrases = document.getElementById("btnBackFromPhrases");


function enableButtons() {
  btnLetras.disabled = false;
  btnFrases.disabled = false;
  btnAudio.disabled = false;
}

// Tenta conectar automaticamente ao carregar a página
async function initConnection() {
  const espHost = document.getElementById("espHost").value;
  try {
    await AppConn.connect(espHost);
    AppConn.logStatus("✅ Conectado ao ESP via WebSocket!");
    enableButtons(); // habilita os botões
  } catch (e) {
    AppConn.logStatus("❌ Falha ao conectar: " + e.message);
  }
}
window.addEventListener("DOMContentLoaded", initConnection);


// Exemplo de navegação (clicando abre a página correspondente)
btnLetras.addEventListener("click", () => {
  connectionSection.style.display = "none";
  lettersSection.style.display = "block";

    renderLetters(); // cria os botões agora

});

btnFrases.addEventListener("click", () => {
  connectionSection.style.display = "none";
  lettersSection.style.display = "none";
  phrasesSection.style.display = "block";
});

btnAudio.addEventListener("click", () => window.location.href = "audio.html");

btnBackToMain.addEventListener("click", () => {
  lettersSection.style.display = "none";
  connectionSection.style.display = "block";
});

btnBackFromPhrases.addEventListener("click", () => {
  phrasesSection.style.display = "none";
  connectionSection.style.display = "block";
});

// Habilita os botões quando o ESP se conecta
AppConn.addListener((msg) => {
  if (msg.type === 'log' && msg.message.includes("Conectado em")) {
    enableButtons();
  }
});
