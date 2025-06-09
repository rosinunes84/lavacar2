// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA5VwxR_u8FfocP1HyS3LLwaQ-N8MSnL8U",
  authDomain: "lavacar-41bda.firebaseapp.com",
  projectId: "lavacar-41bda",
  storageBucket: "lavacar-41bda.appspot.com", // corrigido!
  messagingSenderId: "651303010012",
  appId: "1:651303010012:web:0db89b718f66a014b07e19",
  measurementId: "G-6H83L5PT3M"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar serviços
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
