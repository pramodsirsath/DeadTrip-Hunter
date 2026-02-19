importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");


firebase.initializeApp({
  apiKey: import.meta.env.VITE_apiKey,
  authDomain: import.meta.env.VITE_authDomain,
  projectId: import.meta.env.VITE_projectId,
  messagingSenderId: import.meta.env.VITE_messagingSenderId,
  appId: import.meta.env.VITE_appId,
});

const messaging = firebase.messaging();

// 🔥 THIS IS IMPORTANT
messaging.onBackgroundMessage(function(payload) {
  console.log("BACKGROUND MESSAGE:", payload);

  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: "/driver-marker.png",
    badge: "/driver-marker.png",
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      url: payload.data.url
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


