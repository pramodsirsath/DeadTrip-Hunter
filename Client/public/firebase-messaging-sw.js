importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAPiW40iL_LShrRClfkpgZUk5rAEes5x0s",
  authDomain: "deadtrip-hunter.firebaseapp.com",
  projectId: "deadtrip-hunter",
  messagingSenderId: "267645196070",
  appId: "1:267645196070:web:6a25d5b6a6bc13259c13e7"
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


