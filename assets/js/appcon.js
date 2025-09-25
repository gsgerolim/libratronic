let ws = null;
let listeners = [];

// Conecta ao WebSocket
function connect(host){
  return new Promise((resolve,reject)=>{
    if(ws && ws.readyState === WebSocket.OPEN) return resolve();

    host = host.replace(/^http?:\/\//,"").replace(/\/+$/,"");
    ws = new WebSocket(`wss://${host}:81`);

    ws.onopen = ()=>resolve();
    ws.onclose = ()=>console.log("WS desconectado");
    ws.onerror = (err)=>reject(err);

    ws.onmessage = (evt)=>{
      const data = evt.data;
      try {
        const msg = JSON.parse(data);
        if(msg.cmd === "log") {
          listeners.forEach(cb => cb({ type: 'log', message: msg.message }));
        } else if(Array.isArray(msg)){
          listeners.forEach(cb => cb({ type: 'scan', redes: msg }));
        } else {
          listeners.forEach(cb => cb({ type: 'json', data: msg }));
        }
      } catch(e){
        listeners.forEach(cb => cb({ type: 'log', message: data }));
      }
    };
  });
}

function addListener(cb){ listeners.push(cb); }

function sendWS(obj){
  if(ws && ws.readyState === WebSocket.OPEN){
    ws.send(JSON.stringify(obj));
  } else {
    console.warn("WebSocket não conectado");
  }
}

function getWS() {
  return ws;
}

// HTTP GET
async function apiGet(path){
  const host = document.getElementById("espHost").value.trim().replace(/^http?:\/\//,"").replace(/\/+$/,"");
  const res = await fetch(`http://${host}${path}`);
  if(!res.ok) throw new Error("Falha na requisição HTTP");
  return res.json();
}

// HTTP POST
async function apiPost(path, data){
  const host = document.getElementById("espHost").value.trim().replace(/^http?:\/\//,"").replace(/\/+$/,"");
  const res = await fetch(`http://${host}${path}`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify(data)
  });
  if(!res.ok) throw new Error("Falha na requisição HTTP");
  return res.json();
}

function logStatus(msg){ document.getElementById("status").textContent = msg; }

export const AppConn = { connect, addListener, apiGet, apiPost, logStatus, sendWS, getWS   };
