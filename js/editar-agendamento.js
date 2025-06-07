import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://kiqvzarmwooveklezzfm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjA0MTMsImV4cCI6MjA2MTYzNjQxM30.aW2IAN1xlL8HOZfKqZnGr-7Lw5Ay-AA4MwT-E7dK1A8'
);

const urlParams = new URLSearchParams(window.location.search);
const agendamentoId = urlParams.get('id');

if (!agendamentoId) {
  alert('ID do agendamento não fornecido.');
  window.location.href = 'gerenciar-agendamentos.html';
}

// Carrega a lista de serviços para o select
async function carregarServicos(servicoSelecionadoId) {
  const select = document.getElementById('tipoServico');
  select.innerHTML = '<option value="">Carregando serviços...</option>';

  const { data: servicos, error } = await supabase
    .from('servicos')
    .select('id, nome')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao carregar serviços:', error);
    select.innerHTML = '<option value="">Erro ao carregar</option>';
    return;
  }

  select.innerHTML = '<option value="">Selecione</option>';

  servicos.forEach(servico => {
    const option = document.createElement('option');
    option.value = servico.id;
    option.textContent = servico.nome;

    if (servicoSelecionadoId && servico.id.toString() === servicoSelecionadoId.toString()) {
      option.selected = true;
    }

    select.appendChild(option);
  });
}

// Carrega os dados do agendamento e preenche o formulário
async function carregarAgendamento() {
  const { data, error } = await supabase
    .from('agendamentos')
    .select('*')
    .eq('id', agendamentoId)
    .single();

  if (error || !data) {
    alert('Erro ao carregar agendamento ou agendamento não encontrado.');
    console.error(error);
    window.location.href = 'gerenciar-agendamentos.html';
    return;
  }

  document.getElementById('data').value = data.data ? data.data.split('T')[0] : '';
  document.getElementById('periodo').value = data.periodo ?? '';
  document.getElementById('tipoServico').value = data.servico_id ?? '';
  document.getElementById('veiculo').value = data.veiculo ?? '';
  document.getElementById('observacoes').value = data.observacoes ?? '';
}

// Manipulador do envio do formulário de edição
document.getElementById('formEditar').addEventListener('submit', async (e) => {
  e.preventDefault();

  const dataAgendamento = document.getElementById('data').value;
  const periodo = document.getElementById('periodo').value;
  const servicoId = document.getElementById('tipoServico').value;
  const veiculo = document.getElementById('veiculo').value.trim();
  const observacoes = document.getElementById('observacoes').value.trim();

  if (!dataAgendamento || !periodo || !servicoId || !veiculo) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  const { error } = await supabase
    .from('agendamentos')
    .update({
      data: dataAgendamento,
      periodo: periodo,
      servico_id: servicoId,
      veiculo: veiculo,
      observacoes: observacoes
    })
    .eq('id', agendamentoId);

  if (error) {
    alert('Erro ao atualizar agendamento: ' + error.message);
    console.error(error);
  } else {
    alert('Agendamento atualizado com sucesso!');
    window.location.href = 'meus-agendamentos.html';
  }
});

// Inicializa a página
carregarAgendamento();
carregarServicos();
