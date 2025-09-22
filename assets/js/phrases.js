import { AppConn } from "./appcon.js";

const phraseInput = document.getElementById("phraseInput");
const phraseStatus = document.getElementById("phraseStatus");
const btnSendPhrase = document.getElementById("btnSendPhrase");
const btnStartSpeech = document.getElementById("btnStartSpeech");
const btnStopSpeech = document.getElementById("btnStopSpeech"); // botão parar

let recognition;
let accumulatedTranscript = "";

// --- Reconhecimento de voz ---
if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = "pt-BR";
  recognition.continuous = true;
  recognition.interimResults = true; // mostra parciais
} else {
  phraseStatus.textContent = "❌ Seu navegador não suporta reconhecimento de voz";
}

// --- Enviar frase manual ---
if (btnSendPhrase) {
  btnSendPhrase.addEventListener("click", () => {
    const text = (phraseInput.value || "").trim();
    if (!text) {
      phraseStatus.textContent = "⚠️ Digite ou fale algo antes de enviar!";
      return;
    }

    const ws = AppConn.getWS();
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      phraseStatus.textContent = "⚠️ WebSocket não está conectado!";
      return;
    }

    AppConn.sendWS({ cmd: "send_phrase", phrase: text });
    phraseStatus.textContent = `✅ Frase enviada: "${text}"`;
  });
}

// --- Iniciar fala ---
if (btnStartSpeech && recognition) {
  btnStartSpeech.addEventListener("click", () => {
    accumulatedTranscript = "";
    phraseInput.value = "";
    recognition.start();
    phraseStatus.textContent = "🎙️ Fale algo...";
  });
}

// --- Parar fala ---
if (btnStopSpeech && recognition) {
  btnStopSpeech.addEventListener("click", () => {
    recognition.stop();
    phraseStatus.textContent += " | 🛑 Escuta parada pelo usuário";
  });
}

// --- Processamento do reconhecimento ---
if (recognition) {
  recognition.onresult = (event) => {
    let interim = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript.trim();
      if (event.results[i].isFinal) {
        // envia cada palavra finalizada imediatamente
        const ws = AppConn.getWS();
        if (ws && ws.readyState === WebSocket.OPEN) {
          AppConn.sendWS({ cmd: "send_phrase", phrase: transcript });
          phraseStatus.textContent = `📡 Enviado: "${transcript}"`;
        } else {
          phraseStatus.textContent = "⚠️ WebSocket não está conectado!";
        }

        // acumula no campo de texto
        accumulatedTranscript += transcript + " ";
      } else {
        interim += transcript;
      }
    }

    phraseInput.value = (accumulatedTranscript + interim).trim();
  };

  recognition.onerror = (event) => {
    phraseStatus.textContent = "❌ Erro: " + event.error;

    if (event.error === "no-speech") {
      // reinicia automaticamente
      recognition.stop();
      recognition.start();
    }
  };

  recognition.onend = () => {
    phraseStatus.textContent += " | ✅ Reconhecimento finalizado";
  };
}
