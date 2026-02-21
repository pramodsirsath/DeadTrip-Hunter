import { initializeApp } from "firebase/app";
import {getMessaging} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAPiW40iL_LShrRClfkpgZUk5rAEes5x0s",
  authDomain: "deadtrip-hunter.firebaseapp.com",
  projectId: "deadtrip-hunter",
  storageBucket: "deadtrip-hunter.firebasestorage.app",
  messagingSenderId: "267645196070",
  appId:"1:267645196070:web:6a25d5b6a6bc13259c13e7",
  measurementId: "1:267645196070:web:6a25d5b6a6bc13259c13e7"
};

export const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);