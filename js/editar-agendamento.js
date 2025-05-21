import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kiqvzarmwooveklezzfm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjA0MTMsImV4cCI6MjA2MTYzNjQxM30.aW2IAN1xlL8HOZfKqZnGr-7Lw5Ay-AA4MwT-E7dK1A8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para pegar o id da URL (?id=...)
function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function carregarAgendamento(id) {
  const { data, error } = await supabase.from('agendamentos').select('*').eq('id', id).single();

  if (error) {
    alert('Erro ao carregar agendamento.');
    console.error(error);
    return null;
  }

  return data;
}

async function salvarAgendamento(id, dados) {
  const { error } = await supabase.from('agendamentos').update(dados).eq('id', id);

  if (error) {
    alert('Erro ao salvar agendamento.');
    console.error(error);
    return false;
  }

  return true;
}

window.addEventListener('DOMContentLoaded', async () => {
  const id = getIdFromUrl();
  if (!id) {
    alert('ID do agendamento não informado.');
    window.location.href = 'admin_dashboard.html';
    return;
  }

  const agendamento = await carregarAgendamento(id);
  if (!agendamento) {
    window.location.href = 'admin_dashboard.html';
    return;
  }

  // Preencher formulário
  document.getElementById('nome').value = agendamento.nome || '';
  document.getElementById('data').value = agendamento.data ? agendamento.data.split('T')[0] : '';
  document.getElementById('servico').value = agendamento.servico || '';
  document.getElementById('veiculo').value = agendamento.veiculo || '';
  document.getElementById('status').value = agendamento.status || 'Pendente';

  // Captura submit do form
  document.getElementById('formEditarAgendamento').addEventListener('submit', async (e) => {
    e.preventDefault();

    const dadosAtualizados = {
      nome: document.getElementById('nome').value.trim(),
      data: document.getElementById('data').value,
      servico: document.getElementById('servico').value.trim(),
      veiculo: document.getElementById('veiculo').value.trim(),
      status: document.getElementById('status').value,
    };

    const sucesso = await salvarAgendamento(id, dadosAtualizados);
    if (sucesso) {
      alert('Agendamento salvo com sucesso!');
      window.location.href = 'admin_dashboard.html';
    }
  });
});
