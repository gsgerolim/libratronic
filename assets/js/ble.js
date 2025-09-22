// Minimal Web Bluetooth helper for Nordic UART Service
let bleDevice, bleServer, bleService, bleTx, bleRx;

async function connectBLE(){
  const NUS_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
  const NUS_RX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
  const NUS_TX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

  bleDevice = await navigator.bluetooth.requestDevice({
    filters: [{ services: [NUS_SERVICE] }],
    optionalServices: [NUS_SERVICE]
  });
  bleServer = await bleDevice.gatt.connect();
  bleService = await bleServer.getPrimaryService(NUS_SERVICE);
  bleTx = await bleService.getCharacteristic(NUS_TX);
  bleRx = await bleService.getCharacteristic(NUS_RX);

  await bleTx.startNotifications();
  bleTx.addEventListener("characteristicvaluechanged", ev=>{
    const v = new TextDecoder().decode(ev.target.value);
    console.log("BLE TX notify:", v);
  });
}

async function bleSend(data){
  if (!bleRx) throw new Error("BLE não conectado");
  if (typeof data === "string") {
    const enc = new TextEncoder().encode(data);
    await bleRx.writeValue(enc);
  } else if (data instanceof ArrayBuffer) {
    // Chunk to 180 bytes (BLE MTU constraints)
    const view = new Uint8Array(data);
    for (let i=0; i<view.length; i+=180) {
      await bleRx.writeValue(view.slice(i, i+180));
    }
  } else if (data instanceof Uint8Array) {
    for (let i=0; i<data.length; i+=180) {
      await bleRx.writeValue(data.slice(i, i+180));
    }
  } else {
    throw new Error("Tipo de dado BLE inválido");
  }
}
