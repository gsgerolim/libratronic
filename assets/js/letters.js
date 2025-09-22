import { AppConn } from "./appcon.js";

const letterGrid = document.getElementById("letterGrid");
const letterStatus = document.getElementById("letterStatus");

// Letras A-Z
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function renderLetters() {
  // limpa caso já tenha algo
  letterGrid.innerHTML = "";

  letters.forEach(letter => {
  const btn = document.createElement("button");
  btn.classList.add("btn-letter"); // adiciona uma classe exclusiva
  btn.textContent = letter;
  btn.value = letter;

  btn.addEventListener("click", () => {
    const ws = AppConn.getWS();
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      letterStatus.textContent = "⚠️ WebSocket não está conectado!";
      return;
    }

    AppConn.sendWS({ cmd: "send_letter", letter: btn.value });
    letterStatus.textContent = `✅ Letra enviada: ${btn.value}`;
  });

  letterGrid.appendChild(btn);
});

}
