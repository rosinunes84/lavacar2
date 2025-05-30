import { supabase } from './supabase-client.js';

const listaAgendamentos = document.getElementById('lista-agendamentos');

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
    <table class="agendamento-table">
      <thead>
        <tr>
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
}

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

function editarAgendamento(id) {
  window.location.href = `editar-agendamento.html?id=${id}`;
}

listaAgendamentos.addEventListener('click', (e) => {
  const target = e.target;
  const id = target.getAttribute('data-id');

  if (target.classList.contains('btn-excluir')) {
    excluirAgendamento(id);
  } else if (target.classList.contains('btn-editar')) {
    editarAgendamento(id);
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const usuarioAtual = await carregarUsuarioAtual();
  await carregarAgendamentos(usuarioAtual);
});
