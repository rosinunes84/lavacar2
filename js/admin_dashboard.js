import { supabase } from './supabase-client.js';

let usuarioAtual = null;
let isAdmin = false;

const listaAgendamentos = document.getElementById('lista-agendamentos');
const contadorHoje = document.getElementById('contador-hoje');
const contadorAmanha = document.getElementById('contador-amanha');
const loader = document.getElementById('loader');

function formatarData(dataISO) {
  const data = new Date(dataISO);
  return data.toLocaleDateString('pt-BR');  // dd/mm/aaaa
}

function dataLocalISO(dateObj) {
  const ano = dateObj.getFullYear();
  const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dia = String(dateObj.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function mostrarErro(msg) {
  alert(`Erro: ${msg}`);
}

async function carregarUsuarioAtual() {
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    mostrarErro('Usuário não autenticado.');
    window.location.href = 'index.html';
    return;
  }

  usuarioAtual = authData.user;
  console.log('Usuário logado:', usuarioAtual.id);

  // Limpa espaços (caso existam) para evitar erro no filtro
  const userId = usuarioAtual.id.trim();

  // Busca role na tabela 'usuarios'
  const { data: perfil, error: errorPerfil } = await supabase
    .from('usuarios')
    .select('role')
    .eq('id', userId)
    .single();

  if (errorPerfil || !perfil) {
    mostrarErro('Erro ao buscar perfil do usuário.');
    window.location.href = 'home.html';
    return;
  }

  isAdmin = perfil.role === 'admin';

  if (!isAdmin) {
    alert('Acesso negado. Apenas administradores podem acessar esta página.');
    window.location.href = 'home.html';
  }
}

async function carregarAgendamentos() {
  if (!listaAgendamentos || !contadorHoje || !contadorAmanha) {
    mostrarErro('Elementos HTML necessários não encontrados.');
    return;
  }

  try {
    loader.style.display = 'block';
    listaAgendamentos.innerHTML = '';

    let query = supabase
      .from('agendamentos')
      .select('id, usuario_id, data, periodo, tipo_servico, veiculo')
      .order('data', { ascending: true });

    if (!isAdmin && usuarioAtual) {
      query = query.eq('usuario_id', usuarioAtual.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);

    const hojeISO = dataLocalISO(hoje);
    const amanhaISO = dataLocalISO(amanha);

    let totalHoje = 0;
    let totalAmanha = 0;

    const agendamentosHoje = [];
    const agendamentosAmanha = [];
    const agendamentosFuturos = [];
    const agendamentosPassados = [];

    for (const agendamento of data) {
      const dataObj = new Date(agendamento.data);
      const dataAgendamentoISO = dataLocalISO(dataObj);

      if (dataAgendamentoISO === hojeISO) {
        totalHoje++;
        agendamentosHoje.push(agendamento);
      } else if (dataAgendamentoISO === amanhaISO) {
        totalAmanha++;
        agendamentosAmanha.push(agendamento);
      } else if (dataAgendamentoISO > amanhaISO) {
        agendamentosFuturos.push(agendamento);
      } else {
        agendamentosPassados.push(agendamento);
      }
    }

    const ordenarDataAsc = (a, b) => new Date(a.data) - new Date(b.data);
    agendamentosHoje.sort(ordenarDataAsc);
    agendamentosAmanha.sort(ordenarDataAsc);
    agendamentosFuturos.sort(ordenarDataAsc);
    agendamentosPassados.sort((a, b) => new Date(b.data) - new Date(a.data));

    const agendamentosOrdenados = [
      ...agendamentosHoje,
      ...agendamentosAmanha,
      ...agendamentosFuturos,
      ...agendamentosPassados,
    ];

    const usuarioIds = [...new Set(agendamentosOrdenados.map(a => a.usuario_id))];
    const { data: usuarios } = await supabase
      .from('usuarios')
      .select('id, nome')
      .in('id', usuarioIds);

    const mapaUsuarios = {};
    if (usuarios) {
      usuarios.forEach(u => mapaUsuarios[u.id] = u.nome);
    }

    for (const agendamento of agendamentosOrdenados) {
      const nomeUsuario = mapaUsuarios[agendamento.usuario_id] || 'N/A';
      const dataFormatada = formatarData(agendamento.data);

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
    mostrarErro('Erro ao carregar agendamentos.');
    console.error(err);
    listaAgendamentos.innerHTML = '<p>Erro ao carregar agendamentos.</p>';
  } finally {
    loader.style.display = 'none';
  }
}

async function excluirAgendamento(id) {
  if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

  const botao = document.querySelector(`button[data-id="${id}"].btn-excluir`);
  if (botao) botao.disabled = true;

  const { error } = await supabase.from('agendamentos').delete().eq('id', id);

  if (botao) botao.disabled = false;

  if (error) {
    mostrarErro('Erro ao excluir agendamento.');
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
  const id = target.getAttribute('data-id');

  if (target.classList.contains('btn-excluir')) {
    excluirAgendamento(id);
  } else if (target.classList.contains('btn-editar')) {
    editarAgendamento(id);
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  await carregarUsuarioAtual();
  await carregarAgendamentos();

  // Atualiza automaticamente a lista a cada 20 segundos
  setInterval(() => {
    carregarAgendamentos();
  }, 20000);
});
