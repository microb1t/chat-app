// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "yourapp.firebaseapp.com",
  projectId: "yourapp",
  // etc.
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Generate or get user code
let yourCode = localStorage.getItem("code");
if (!yourCode) {
  yourCode = Math.random().toString(36).substring(2, 8);
  localStorage.setItem("code", yourCode);
}
document.getElementById("yourCode").textContent = yourCode;

let chatRoom = "";

function connect() {
  const friendCode = document.getElementById("friendCode").value.trim();
  if (!friendCode) return alert("Enter a friend's code!");

  // Use combined code as room ID (sorted alphabetically to avoid mismatch)
  chatRoom = [yourCode, friendCode].sort().join("_");

  document.getElementById("chat").style.display = "block";
  listenForMessages();
}

function sendMessage() {
  const msg = document.getElementById("messageInput").value.trim();
  if (!msg) return;

  db.collection("chats").doc(chatRoom).collection("messages").add({
    sender: yourCode,
    text: msg,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  });

  document.getElementById("messageInput").value = "";
}

function listenForMessages() {
  db.collection("chats")
    .doc(chatRoom)
    .collection("messages")
    .orderBy("timestamp")
    .onSnapshot(snapshot => {
      const msgBox = document.getElementById("messages");
      msgBox.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        const msg = document.createElement("div");
        msg.textContent = `${data.sender === yourCode ? "You" : "Them"}: ${data.text}`;
        msgBox.appendChild(msg);
      });
      msgBox.scrollTop = msgBox.scrollHeight;
    });
}

