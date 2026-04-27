import {
  messagesRef,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "./firebase.js";

const input = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const messagesContainer = document.getElementById("messages-container");

// إرسال رسالة
sendBtn.addEventListener("click", async () => {
  if (!input.value.trim()) return;

  await addDoc(messagesRef, {
    text: input.value,
    time: Date.now()
  });

  input.value = "";
});

// عرض الرسائل
const q = query(messagesRef, orderBy("time"));

onSnapshot(q, (snapshot) => {
  messagesContainer.innerHTML = "";

  snapshot.forEach((doc) => {
    const msg = doc.data();

    const div = document.createElement("div");
    div.innerText = msg.text;

    messagesContainer.appendChild(div);
  });
});