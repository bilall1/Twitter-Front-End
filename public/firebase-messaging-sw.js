// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = ({
    apiKey: "AIzaSyDSToI0wVSrAzft3c8EHM99jkn7PCoCzqE",
    authDomain: "twitter-clone-695cb.firebaseapp.com",
    projectId:"twitter-clone-695cb",
    storageBucket:"twitter-clone-695cb.appspot.com",
    messagingSenderId: " 533095311450",
    appId: "1:533095311450:web:bcbe96f9906014c2e29063",
    measurementId: "G-ML7Q87MV98"
  });


firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);
 // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
