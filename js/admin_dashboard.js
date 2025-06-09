import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', async () => {
  const listaAgendamentos = document.getElementById('lista-agendamentos');
  const contadorHoje = document.getElementById('contador-hoje');
  const contadorAmanha = document.getElementById('contador-amanha');
  const loader = document.getElementById('loader');

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (!sessionData?.session) {
    console.warn('Sessão inválida. Redirecionando para login.');
    window.location.href = 'login.html';
    return;
  }

  const LIMITE_POR_PERIODO = 5;

  const formatarDataBR = (data) => new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');

  function adicionarSecao(titulo, agendamentos, mapaUsuarios) {
    if (agendamentos.length === 0) return;

    const tituloEl = document.createElement('h3');
    tituloEl.textContent = titulo;
    listaAgendamentos.appendChild(tituloEl);

    const agendamentosPorData = {};

    agendamentos.forEach(agendamento => {
      const data = agendamento.data;
      const periodo = agendamento.periodo || 'N/A';

      if (!agendamentosPorData[data]) agendamentosPorData[data] = {};
      if (!agendamentosPorData[data][periodo]) agendamentosPorData[data][periodo] = [];

      agendamentosPorData[data][periodo].push(agendamento);
    });

    Object.entries(agendamentosPorData).forEach(([data, periodos]) => {
      const dataTitulo = document.createElement('h4');
      dataTitulo.textContent = `Data: ${formatarDataBR(data)}`;
      listaAgendamentos.appendChild(dataTitulo);

      Object.entries(periodos).forEach(([periodo, ags]) => {
        const bloqueado = ags.length >= LIMITE_POR_PERIODO;
        const periodoTitulo = document.createElement('h5');
        periodoTitulo.textContent = `Período: ${periodo} (${ags.length}/${LIMITE_POR_PERIODO})${bloqueado ? ' - BLOQUEADO' : ''}`;
        periodoTitulo.style.color = bloqueado ? 'red' : 'black';
        listaAgendamentos.appendChild(periodoTitulo);

        ags.forEach(agendamento => {
          const nomeUsuario = mapaUsuarios[agendamento.usuario_id] || 'N/A';
          const nomeServico = agendamento.servico?.nome || 'N/A';
          const observacoes = agendamento.observacoes || 'Nenhuma observação';

          const div = document.createElement('div');
          div.className = 'agendamento';
          div.innerHTML = `
            <p><strong>Usuário:</strong> ${nomeUsuario}</p>
            <p><strong>Período:</strong> ${periodo}</p>
            <p><strong>Veículo:</strong> ${agendamento.veiculo || 'N/A'}</p>
            <p><strong>Serviço:</strong> ${nomeServico}</p>
            <p><strong>Observações:</strong> ${observacoes}</p>
          `;
          listaAgendamentos.appendChild(div);
        });
      });
    });
  }

  async function carregarAgendamentosAdmin() {
    listaAgendamentos.innerHTML = '';
    contadorHoje.textContent = '';
    contadorAmanha.textContent = '';
    loader.style.display = 'block';

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

    const usuarioIds = [...new Set(agendamentos.map(a => a.usuario_id))];
    const { data: usuarios, error: errorUsuarios } = await supabase
      .from('usuarios')
      .select('id, nome')
      .in('id', usuarioIds);

    const mapaUsuarios = {};
    if (usuarios) {
      usuarios.forEach(u => {
        mapaUsuarios[u.id] = u.nome;
      });
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    const agendamentosHoje = [], agendamentosAmanha = [], agendamentosFuturos = [], agendamentosAntigos = [];

    agendamentos.forEach(a => {
      const dataAgendamento = new Date(a.data + 'T00:00:00');
      if (dataAgendamento.getTime() === hoje.getTime()) agendamentosHoje.push(a);
      else if (dataAgendamento.getTime() === amanha.getTime()) agendamentosAmanha.push(a);
      else if (dataAgendamento > amanha) agendamentosFuturos.push(a);
      else agendamentosAntigos.push(a);
    });

    const ordenarPorDataAsc = arr => arr.sort((a, b) => new Date(a.data) - new Date(b.data));
    const ordenarPorDataDesc = arr => arr.sort((a, b) => new Date(b.data) - new Date(a.data));

    ordenarPorDataAsc(agendamentosHoje);
    ordenarPorDataAsc(agendamentosAmanha);
    ordenarPorDataAsc(agendamentosFuturos);
    ordenarPorDataDesc(agendamentosAntigos);

    contadorHoje.textContent = `Agendamentos para Hoje: ${agendamentosHoje.length}`;
    contadorAmanha.textContent = `Agendamentos para Amanhã: ${agendamentosAmanha.length}`;

    adicionarSecao('Agendamentos de Hoje', agendamentosHoje, mapaUsuarios);
    adicionarSecao('Agendamentos de Amanhã', agendamentosAmanha, mapaUsuarios);
    adicionarSecao('Agendamentos Futuros', agendamentosFuturos, mapaUsuarios);
    adicionarSecao('Agendamentos Antigos', agendamentosAntigos, mapaUsuarios);
  }

  carregarAgendamentosAdmin();
});
