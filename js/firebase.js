import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBxHEpCB6baqHBbHjm5RrEtFeAGKyxbMO8",
  authDomain: "final-chat-edd60.firebaseapp.com",
  projectId: "final-chat-edd60",
  storageBucket: "final-chat-edd60.firebasestorage.app",
  messagingSenderId: "775124501600",
  appId: "1:775124501600:web:2899b4cf62f937d04c2f05",
};

// Init Firebase
const app = initializeApp(firebaseConfig);

// Firestore
const db = getFirestore(app);
const messagesRef = collection(db, "messages");

// =======================
// ✅ SEND MESSAGE
// =======================
export async function sendMessage(text, user) {
  await addDoc(messagesRef, {
    text,
    user,
    createdAt: Date.now()
  });
}

// =======================
// ✅ REALTIME LISTENER
// =======================
export function listenMessages(callback) {
  const q = query(messagesRef, orderBy("createdAt"));

  onSnapshot(q, (snapshot) => {
    const messages = [];

    snapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });

    callback(messages);
  });
}