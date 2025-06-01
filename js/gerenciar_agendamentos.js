import { supabase } from './supabase-client.js';

const listaAgendamentos = document.getElementById('lista-agendamentos');

// Criar botão excluir selecionados (assumindo que ele está no HTML com id "btn-excluir-selecionados")
const btnExcluirSelecionados = document.getElementById('btn-excluir-selecionados');

async function carregarUsuarioAtual() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Erro ao obter usuário:', error);
    return null;
  }
  if (!data?.user) {
    console.warn('Usuário não autenticado.');
    return null;
  }
  return data.user;
}

async function carregarAgendamentos(usuarioAtual) {
  listaAgendamentos.innerHTML = '<p>Carregando agendamentos...</p>';

  let query = supabase
    .from('agendamentos')
    .select('*, servico:servico_id (nome)')
    .order('data', { ascending: true });

  if (usuarioAtual) {
    const { data: perfil, error: errorPerfil } = await supabase
      .from('usuarios')
      .select('role')
      .eq('id', usuarioAtual.id)
      .single();

    if (errorPerfil) {
      console.error('Erro ao obter perfil:', errorPerfil);
      listaAgendamentos.innerHTML = '<p>Erro ao carregar perfil do usuário.</p>';
      return;
    }

    if (!perfil || perfil.role !== 'admin') {
      query = query.eq('usuario_id', usuarioAtual.id);
    }
  }

  const { data: agendamentos, error } = await query;
  if (error) {
    console.error('Erro ao carregar agendamentos:', error);
    listaAgendamentos.innerHTML = '<p>Erro ao carregar agendamentos.</p>';
    return;
  }

  if (!agendamentos || agendamentos.length === 0) {
    listaAgendamentos.innerHTML = '<p>Nenhum agendamento encontrado.</p>';
    btnExcluirSelecionados.style.display = 'none';
    return;
  }

  const usuarioIds = [...new Set(agendamentos.map(a => a.usuario_id))];

  const { data: usuarios, error: errorUsuarios } = await supabase
    .from('usuarios')
    .select('id, nome')
    .in('id', usuarioIds);

  if (errorUsuarios) {
    console.error('Erro ao carregar usuários:', errorUsuarios);
  }

  const mapaUsuarios = {};
  if (usuarios) {
    usuarios.forEach(u => {
      mapaUsuarios[u.id] = u.nome;
    });
  }

  renderizarTabelaAgendamentos(agendamentos, mapaUsuarios);
}

function renderizarTabelaAgendamentos(agendamentos, mapaUsuarios) {
  let tabelaHTML = `
    <table class="agendamento-table" style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th><input type="checkbox" id="checkbox-todos" title="Selecionar Todos" /></th>
          <th>Usuário</th>
          <th>Data</th>
          <th>Período</th>
          <th>Veículo</th>
          <th>Serviço</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
  `;

  agendamentos.forEach(agendamento => {
    const nomeUsuario = mapaUsuarios[agendamento.usuario_id] || 'N/A';
    const dataFormatada = agendamento.data
      ? new Date(agendamento.data + 'T00:00:00').toLocaleDateString('pt-BR')
      : 'N/A';
    const nomeServico = agendamento.servico?.nome || agendamento.servico_id || 'N/A';

    tabelaHTML += `
      <tr data-id="${agendamento.id}">
        <td style="text-align:center;">
          <input type="checkbox" class="checkbox-agendamento" data-id="${agendamento.id}" />
        </td>
        <td>${nomeUsuario}</td>
        <td>${dataFormatada}</td>
        <td>${agendamento.periodo || 'N/A'}</td>
        <td>${agendamento.veiculo || 'N/A'}</td>
        <td>${nomeServico}</td>
        <td>
          <button class="btn-editar" data-id="${agendamento.id}">Editar</button>
          <button class="btn-excluir" data-id="${agendamento.id}">Excluir</button>
        </td>
      </tr>
    `;
  });

  tabelaHTML += '</tbody></table>';
  listaAgendamentos.innerHTML = tabelaHTML;

  // Exibir botão excluir selecionados
  btnExcluirSelecionados.style.display = 'block';

  // Configurar eventos para checkbox "Selecionar Todos"
  const checkboxTodos = document.getElementById('checkbox-todos');
  checkboxTodos.addEventListener('change', () => {
    const checkboxes = document.querySelectorAll('.checkbox-agendamento');
    checkboxes.forEach(cb => cb.checked = checkboxTodos.checked);
  });
}

// Excluir único agendamento
async function excluirAgendamento(id) {
  if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

  const { error } = await supabase.from('agendamentos').delete().eq('id', id);
  if (error) {
    console.error('Erro ao excluir agendamento:', error);
    alert('Erro ao excluir agendamento.');
    return;
  }

  alert('Agendamento excluído com sucesso!');
  const usuarioAtual = await carregarUsuarioAtual();
  await carregarAgendamentos(usuarioAtual);
}

// Excluir múltiplos agendamentos selecionados
async function excluirSelecionados() {
  const checkboxes = document.querySelectorAll('.checkbox-agendamento:checked');
  if (checkboxes.length === 0) {
    alert('Selecione ao menos um agendamento para excluir.');
    return;
  }

  if (!confirm(`Tem certeza que deseja excluir ${checkboxes.length} agendamento(s)?`)) return;

  const ids = Array.from(checkboxes).map(cb => cb.getAttribute('data-id'));

  const { error } = await supabase.from('agendamentos').delete().in('id', ids);
  if (error) {
    console.error('Erro ao excluir agendamentos:', error);
    alert('Erro ao excluir agendamentos.');
    return;
  }

  alert('Agendamento(s) excluído(s) com sucesso!');
  const usuarioAtual = await carregarUsuarioAtual();
  await carregarAgendamentos(usuarioAtual);
}

function editarAgendamento(id) {
  window.location.href = `editar-agendamento.html?id=${id}`;
}

// Eventos de clique na tabela para editar e excluir único
listaAgendamentos.addEventListener('click', (e) => {
  const target = e.target;
  const id = target.getAttribute('data-id');

  if (target.classList.contains('btn-excluir')) {
    excluirAgendamento(id);
  } else if (target.classList.contains('btn-editar')) {
    editarAgendamento(id);
  }
});

// Evento do botão excluir selecionados
btnExcluirSelecionados.addEventListener('click', excluirSelecionados);

document.addEventListener('DOMContentLoaded', async () => {
  const usuarioAtual = await carregarUsuarioAtual();
  await carregarAgendamentos(usuarioAtual);
});
