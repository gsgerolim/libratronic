const $ = (s)=>document.querySelector(s);
let mediaRecorder, chunks = [];

async function startRec(){
  const stream = await navigator.mediaDevices.getUserMedia({audio:true});
  mediaRecorder = new MediaRecorder(stream, {mimeType: "audio/webm"});
  chunks = [];
  mediaRecorder.ondataavailable = e=>{ if (e.data.size>0) chunks.push(e.data); };
  mediaRecorder.onstop = ()=>{
    const blob = new Blob(chunks, {type:"audio/webm"});
    AppConn.setLastAudio(blob);
    $("#preview").src = URL.createObjectURL(blob);
    $("#audioStatus").textContent = "Status: gravação pronta ("+Math.round(blob.size/1024)+" KB)";
  };
  mediaRecorder.start(250);
  $("#audioStatus").textContent = "Status: gravando...";
}

function stopRec(){
  if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
}

async function sendAudio(){
  const blob = AppConn.getLastAudio();
  if (!blob) { $("#audioStatus").textContent = "Status: grave algo antes"; return; }
  const arrbuf = await blob.arrayBuffer();
  try {
    AppConn.sendBinary(arrbuf);
    $("#audioStatus").textContent = "Status: áudio enviado ("+Math.round(blob.size/1024)+" KB)";
  } catch(e) {
    $("#audioStatus").textContent = "Status: erro -> " + e.message;
  }
}

$("#btnStartRec")?.addEventListener("click", startRec);
$("#btnStopRec")?.addEventListener("click", stopRec);
$("#btnSendAudio")?.addEventListener("click", sendAudio);
