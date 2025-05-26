import { supabase } from './supabase-client.js';

let usuarioAtual = null;
let isAdmin = false;

const listaAgendamentos = document.getElementById('lista-agendamentos');
const contadorHoje = document.getElementById('contador-hoje');
const contadorAmanha = document.getElementById('contador-amanha');

// Função para formatar a data como "dd/mm/aaaa"
function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split('T')[0].split('-');
  return `${dia}/${mes}/${ano}`;
}

async function carregarUsuarioAtual() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    console.error('Usuário não autenticado:', error);
    return;
  }
  usuarioAtual = data.user;

  const { data: perfil, error: errorPerfil } = await supabase
    .from('usuarios')
    .select('role')
    .eq('id', usuarioAtual.id)
    .single();

  if (errorPerfil || !perfil) {
    console.error('Erro ao buscar perfil do usuário:', errorPerfil);
    return;
  }

  isAdmin = perfil.role === 'admin';
}

async function carregarAgendamentos() {
  if (!listaAgendamentos || !contadorHoje || !contadorAmanha) {
    console.error('Elementos HTML necessários não encontrados');
    return;
  }

  try {
    listaAgendamentos.innerHTML = '<p>Carregando agendamentos...</p>';

    let query = supabase
      .from('agendamentos')
      .select('*')
      .order('data', { ascending: true });

    if (!isAdmin && usuarioAtual) {
      query = query.eq('usuario_id', usuarioAtual.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    listaAgendamentos.innerHTML = '';

    const hoje = new Date().toISOString().split('T')[0];
    const amanha = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    let totalHoje = 0;
    let totalAmanha = 0;

    const usuarioIds = [...new Set(data.map(a => a.usuario_id))];
    const { data: usuarios } = await supabase
      .from('usuarios')
      .select('id, nome')
      .in('id', usuarioIds);

    const mapaUsuarios = {};
    if (usuarios) {
      usuarios.forEach(u => mapaUsuarios[u.id] = u.nome);
    }

    const agendamentosHoje = data.filter(a => a.data === hoje);
    const agendamentosOutros = data.filter(a => a.data !== hoje);
    const agendamentosOrdenados = [...agendamentosHoje, ...agendamentosOutros];

    for (const agendamento of agendamentosOrdenados) {
      const dataAgendamento = agendamento.data;
      const nomeUsuario = mapaUsuarios[agendamento.usuario_id] || 'N/A';
      const dataFormatada = formatarData(dataAgendamento);

      if (dataAgendamento === hoje) totalHoje++;
      if (dataAgendamento === amanha) totalAmanha++;

      const div = document.createElement('div');
      div.className = 'agendamento';
      div.innerHTML = `
      <strong>Usuário:</strong> ${nomeUsuario}<br/>  
      <strong>Data:</strong> ${dataFormatada}<br/>
      <strong>Período:</strong> ${agendamento.periodo || 'N/A'}<br/>
      <strong>Serviço:</strong> ${agendamento.tipo_servico || 'N/A'}<br/>
        <strong>Veículo:</strong> ${agendamento.veiculo || 'N/A'}<br/>
        
        
        
        <div class="acoes">
          <button class="btn-editar" data-id="${agendamento.id}">Editar</button>
          <button class="btn-excluir" data-id="${agendamento.id}">Excluir</button>
        </div>
      `;
      listaAgendamentos.appendChild(div);
    }

    contadorHoje.textContent = `Agendamentos de hoje: ${totalHoje}`;
    contadorAmanha.textContent = `Agendamentos de amanhã: ${totalAmanha}`;

  } catch (err) {
    console.error('Erro ao carregar agendamentos:', err);
    listaAgendamentos.innerHTML = '<p>Erro ao carregar agendamentos.</p>';
  }
}

async function excluirAgendamento(id) {
  if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;
  const { error } = await supabase.from('agendamentos').delete().eq('id', id);
  if (error) {
    alert('Erro ao excluir agendamento.');
    console.error(error);
  } else {
    alert('Agendamento excluído com sucesso!');
    carregarAgendamentos();
  }
}

function editarAgendamento(id) {
  window.location.href = `editar-agendamento.html?id=${id}`;
}

listaAgendamentos.addEventListener('click', (e) => {
  const target = e.target;
  if (target.classList.contains('btn-excluir')) {
    const id = target.getAttribute('data-id');
    excluirAgendamento(id);
  } else if (target.classList.contains('btn-editar')) {
    const id = target.getAttribute('data-id');
    editarAgendamento(id);
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  await carregarUsuarioAtual();
  await carregarAgendamentos();
});
