import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function verificarAdmin() {
  // Aqui você pode colocar a lógica para verificar se o usuário é admin,
  // por enquanto, só redireciona direto:
  window.location.href = 'admin_dashboard.html';
}

document.getElementById('btnVerificarAdmin').addEventListener('click', verificarAdmin);

// NOVO: captura o botão Perfil e adiciona evento para redirecionar
const btnPerfil = document.getElementById('btnPerfil');
if (btnPerfil) {
  btnPerfil.addEventListener('click', () => {
    window.location.href = 'perfil.html';
  });
}

async function carregarDados() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
    });
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  }
}

carregarDados();
