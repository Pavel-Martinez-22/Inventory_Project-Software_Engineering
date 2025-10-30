const publicVapidKey =
  "BHZ4_iFOtSOogfrb5g30slPYtcSnJFogJbMB8B-sWNNr5Q2wmqkbCqBy7ugxMOe8aU6IGz8IOe9o4yK-ftEcF64";

//Check for service worker
if ("serviceWorker" in navigator) {
  send().catch((err) => console.error(err));
}

//Register Service Worker, Register Push, Send Push
async function send() {
  //Console.log will be use to see the example not needed in real code
  console.log("Registering service worker...");
  //Register Service Worker
  const register = await navigator.serviceWorker.register("/worker.js", {
    scope: "/",
  });
  console.log("Service Worker Registered...");

  //Register Push
  console.log("Registering Push...");
  const subscription = await register.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
  });
  console.log("Push Registered...");

  // Send Push Notification
  console.log("Sending Push...");
  await fetch("/api/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: {
      "content-type": "application/json",
    },
  });
  console.log("Push Sent...");
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
