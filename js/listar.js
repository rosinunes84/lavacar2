import { auth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { supabase } from './supabase-client.js';

console.log("📋 Página de listagem carregada");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("Usuário autenticado:", user.uid);

    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('usuario_id', user.uid);

    const container = document.getElementById('agendamentos-container');
    container.innerHTML = '';

    if (error) {
      console.error("Erro ao buscar agendamentos:", error);
      container.innerHTML = `<p>Erro ao carregar agendamentos.</p>`;
      return;
    }

    if (data.length === 0) {
      container.innerHTML = `<p>Nenhum agendamento encontrado.</p>`;
      return;
    }

    data.forEach((agendamento) => {
      const item = document.createElement('div');
      item.className = 'agendamento-item';
      item.innerHTML = `
        <p><strong>Data:</strong> ${agendamento.data}</p>
        <p><strong>Período:</strong> ${agendamento.periodo}</p>
        <p><strong>Serviço:</strong> ${agendamento.servico}</p>
        <p><strong>Veículo:</strong> ${agendamento.veiculo}</p>
        <p><strong>Status:</strong> ${agendamento.status}</p>
        <hr>
      `;
      container.appendChild(item);
    });

  } else {
    console.warn("Usuário não autenticado.");
    window.location.href = "login.html"; // Redireciona se não estiver logado
  }
});
