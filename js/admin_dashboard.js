import { supabase } from './supabase-client.js';

const listaAgendamentos = document.getElementById('lista-agendamentos');
const contadorHoje = document.getElementById('contador-hoje');
const contadorAmanha = document.getElementById('contador-amanha');
const loader = document.getElementById('loader');

function formatarDataBR(data) {
  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
}

// Função que verifica se duas datas são o mesmo dia (ano, mês, dia)
function isMesmaData(data1, data2) {
  return (
    data1.getFullYear() === data2.getFullYear() &&
    data1.getMonth() === data2.getMonth() &&
    data1.getDate() === data2.getDate()
  );
}

// Função para adicionar uma seção com título e lista de agendamentos
function adicionarSecao(titulo, agendamentos, mapaUsuarios) {
  if (agendamentos.length === 0) return;

  const tituloEl = document.createElement('h3');
  tituloEl.textContent = titulo;
  listaAgendamentos.appendChild(tituloEl);

  agendamentos.forEach(agendamento => {
    const nomeUsuario = mapaUsuarios[agendamento.usuario_id] || 'N/A';
    const nomeServico = agendamento.servico ? agendamento.servico.nome : 'N/A';

    const div = document.createElement('div');
    div.className = 'agendamento';
    div.innerHTML = `
      <p><strong>Usuário:</strong> ${nomeUsuario}</p>
      <p><strong>Data:</strong> ${formatarDataBR(agendamento.data)}</p>
      <p><strong>Período:</strong> ${agendamento.periodo || 'N/A'}</p>
      <p><strong>Veículo:</strong> ${agendamento.veiculo || 'N/A'}</p>
      <p><strong>Serviço:</strong> ${nomeServico}</p>
    `;
    listaAgendamentos.appendChild(div);
  });
}

async function carregarAgendamentosAdmin() {
  loader.style.display = 'block';
  listaAgendamentos.innerHTML = '';
  contadorHoje.textContent = '';
  contadorAmanha.textContent = '';

  const { data: agendamentos, error } = await supabase
    .from('agendamentos')
    .select('*, servico:servico_id (nome)')
    .order('data', { ascending: true });

  loader.style.display = 'none';

  if (error) {
    console.error('Erro ao carregar agendamentos:', error);
    listaAgendamentos.innerHTML = '<p>Erro ao carregar agendamentos.</p>';
    return;
  }

  if (!agendamentos || agendamentos.length === 0) {
    listaAgendamentos.innerHTML = '<p>Nenhum agendamento encontrado.</p>';
    return;
  }

  // Pegar IDs únicos de usuários
  const usuarioIds = [...new Set(agendamentos.map(a => a.usuario_id))];

  // Buscar nomes dos usuários
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

  // Datas de referência para hoje e amanhã (sem horário)
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);

  // Separar os agendamentos em grupos
  const agendamentosHoje = [];
  const agendamentosAmanha = [];
  const agendamentosFuturos = [];
  const agendamentosAntigos = [];

  agendamentos.forEach(a => {
    const dataAgendamento = new Date(a.data + 'T00:00:00');

    if (dataAgendamento.getTime() === hoje.getTime()) {
      agendamentosHoje.push(a);
    } else if (dataAgendamento.getTime() === amanha.getTime()) {
      agendamentosAmanha.push(a);
    } else if (dataAgendamento > amanha) {
      agendamentosFuturos.push(a);
    } else if (dataAgendamento < hoje) {
      agendamentosAntigos.push(a);
    }
  });

  // Funções para ordenar os grupos
  function ordenarPorDataAsc(arr) {
    return arr.sort((a, b) => new Date(a.data) - new Date(b.data));
  }

  function ordenarPorDataDesc(arr) {
    return arr.sort((a, b) => new Date(b.data) - new Date(a.data));
  }

  ordenarPorDataAsc(agendamentosHoje);
  ordenarPorDataAsc(agendamentosAmanha);
  ordenarPorDataAsc(agendamentosFuturos);
  ordenarPorDataDesc(agendamentosAntigos);

  // Atualizar contadores
  contadorHoje.textContent = `Agendamentos para Hoje: ${agendamentosHoje.length}`;
  contadorAmanha.textContent = `Agendamentos para Amanhã: ${agendamentosAmanha.length}`;

  // Montar a listagem na ordem correta
  adicionarSecao('Agendamentos de Hoje', agendamentosHoje, mapaUsuarios);
  adicionarSecao('Agendamentos de Amanhã', agendamentosAmanha, mapaUsuarios);
  adicionarSecao('Agendamentos Futuros', agendamentosFuturos, mapaUsuarios);
  adicionarSecao('Agendamentos Antigos', agendamentosAntigos, mapaUsuarios);
}

document.addEventListener('DOMContentLoaded', carregarAgendamentosAdmin);
