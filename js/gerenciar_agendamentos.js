// js/gerenciar_agendamentos.js
import { supabase } from './supabase-config.js';

const listaAgendamentos = document.getElementById('listaAgendamentos');

export async function carregarAgendamentos() {
  const data = document.getElementById('filtroData').value;
  const status = document.getElementById('filtroStatus').value;

  let query = supabase.from('agendamentos').select('*');

  if (data) query = query.eq('data', data);
  if (status) query = query.eq('status', status);

  const { data: agendamentos, error } = await query;
  if (error) return alert("Erro ao carregar: " + error.message);

  listaAgendamentos.innerHTML = "";

  agendamentos.forEach((ag) => {
    const linha = document.createElement("tr");

    linha.innerHTML = `
      <td>${ag.cliente || "-"}</td>
      <td>${ag.data}</td>
      <td>${ag.periodo}</td>
      <td>${ag.veiculo}</td>
      <td>${ag.servico}</td>
      <td>
        <select onchange="alterarStatus(${ag.id}, this.value)">
          <option ${ag.status === "Confirmado" ? "selected" : ""}>Confirmado</option>
          <option ${ag.status === "Em andamento" ? "selected" : ""}>Em andamento</option>
          <option ${ag.status === "Finalizado" ? "selected" : ""}>Finalizado</option>
          <option ${ag.status === "Cancelado" ? "selected" : ""}>Cancelado</option>
        </select>
      </td>
    `;

    listaAgendamentos.appendChild(linha);
  });
}

window.carregarAgendamentos = carregarAgendamentos;

window.alterarStatus = async function(id, novoStatus) {
  const { error } = await supabase
    .from('agendamentos')
    .update({ status: novoStatus })
    .eq('id', id);

  if (error) return alert("Erro ao alterar status");
  alert("Status atualizado com sucesso!");
  carregarAgendamentos();
};

carregarAgendamentos();
