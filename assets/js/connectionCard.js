const connectionCard = document.getElementById("connectionCard");
const wifiIcon = document.getElementById("wifiIcon");
const closeCard = document.querySelector("#connectionCard .close");

// Abrir popup ao clicar no ícone
wifiIcon.addEventListener("click", () => {
  connectionCard.style.display = "block";
});

// Fechar popup
closeCard.addEventListener("click", () => {
  connectionCard.style.display = "none";
});
