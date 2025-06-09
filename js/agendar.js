// ✅ Supabase Client
const supabaseClient = supabase.createClient(
  'https://kiqvzarmwooveklezzfm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjA0MTMsImV4cCI6MjA2MTYzNjQxM30.aW2IAN1xlL8HOZfKqZnGr-7Lw5Ay-AA4MwT-E7dK1A8'
);

// ✅ Verifica se o usuário está autenticado
async function verificarSessao() {
  const { data, error } = await supabaseClient.auth.getUser();
  if (error || !data?.user) {
    window.location.href = 'index.html';
  }
}

// ✅ Envia e-mail de agendamento
async function enviarEmailAgendamento(agendamentoId) {
  try {
    const { data: agendamento, error: agendamentoError } = await supabaseClient
      .from('agendamentos')
      .select('*')
      .eq('id', agendamentoId)
      .single();

    if (agendamentoError) throw agendamentoError;

    const { data: usuario, error: usuarioError } = await supabaseClient
      .from('usuarios')
      .select('nome')
      .eq('id', agendamento.usuario_id)
      .single();

    if (usuarioError) throw usuarioError;

    const { data: servico, error: servicoError } = await supabaseClient
      .from('servicos')
      .select('nome')
      .eq('id', agendamento.servico_id)
      .single();

    if (servicoError) throw servicoError;

    const dataObj = new Date(agendamento.data);
    const dataFormatada = dataObj.toLocaleDateString('pt-BR');

    const emailParams = {
      usuario_nome: usuario.nome || 'Nome não informado',
      servico_nome: servico.nome || 'Serviço não informado',
      data: dataFormatada,
      periodo: agendamento.periodo || 'Período não informado',
      veiculo: agendamento.veiculo || 'Não informado'
    };

    console.log('➡️ Enviando e-mail:', emailParams);

    await emailjs.send("service_n2fghu7", "template_eioflwb", emailParams);
    console.log('✅ E-mail enviado com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao enviar e-mail:', err);
  }
}

// ✅ Carrega vagas restantes
async function carregarVagasRestantes(data, periodo) {
  if (!data || !periodo) {
    document.getElementById('vagas-restantes').textContent = '';
    return;
  }

  const { data: quantidadeConfig, error: erroQuantidade } = await supabaseClient
    .from('quantidades_periodos')
    .select('quantidade')
    .eq('periodo', periodo)
    .single();

  if (erroQuantidade || !quantidadeConfig) {
    document.getElementById('vagas-restantes').textContent = 'Não foi possível carregar vagas restantes.';
    return;
  }

  const quantidadeMaxima = Number(quantidadeConfig.quantidade);

  const { count, error: erroContagem } = await supabaseClient
    .from('agendamentos')
    .select('*', { count: 'exact', head: true })
    .eq('data', data)
    .eq('periodo', periodo);

  if (erroContagem) {
    document.getElementById('vagas-restantes').textContent = 'Erro ao contar agendamentos.';
    return;
  }

  const vagasRestantes = quantidadeMaxima - count;
  const vagasTexto = vagasRestantes > 0 ? `${vagasRestantes} vaga(s) restante(s)` : 'Sem vagas restantes';

  document.getElementById('vagas-restantes').textContent = vagasTexto;

  console.log(`📊 Vagas máximas: ${quantidadeMaxima}, Agendados: ${count}, Restantes: ${vagasRestantes}`);
}

// ✅ Logout
async function sair() {
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}

// ✅ Carrega lista de serviços
async function carregarServicos() {
  const select = document.getElementById('tipoServico');
  select.innerHTML = '<option value="">Carregando serviços...</option>';

  const { data: servicos, error } = await supabaseClient
    .from('servicos')
    .select('id, nome')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao carregar serviços:', error);
    select.innerHTML = '<option value="">Erro ao carregar serviços</option>';
    return;
  }

  if (!servicos.length) {
    select.innerHTML = '<option value="">Nenhum serviço disponível</option>';
    return;
  }

  select.innerHTML = '<option value="">Selecione</option>';
  servicos.forEach(({ id, nome }) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = nome;
    select.appendChild(option);
  });
}

// ✅ Verifica se a data está bloqueada
async function verificarDiaBloqueado(data) {
  const { data: bloqueios, error } = await supabaseClient
    .from('dias_bloqueados')
    .select('*')
    .eq('data', data);

  if (error) {
    console.error('Erro ao verificar bloqueios:', error);
    return false;
  }
  return bloqueios.length > 0;
}

// ✅ Verifica se o limite de agendamentos foi atingido
async function verificarLimitePorPeriodo(data, periodo) {
  const { data: qtdPeriodo, error: errQtdPeriodo } = await supabaseClient
    .from('quantidades_periodos')
    .select('quantidade')
    .eq('periodo', periodo)
    .single();

  if (errQtdPeriodo || !qtdPeriodo) {
    console.warn('Configuração de quantidade não encontrada:', errQtdPeriodo);
    return false;
  }

  const quantidadeMaxima = Number(qtdPeriodo.quantidade);

  const { count, error: errCount } = await supabaseClient
    .from('agendamentos')
    .select('*', { count: 'exact', head: true })
    .eq('data', data)
    .eq('periodo', periodo);

  if (errCount) {
    console.error('Erro ao contar agendamentos:', errCount);
    return false;
  }

  console.log(`🔢 Agendamentos: ${count}/${quantidadeMaxima}`);
  return count < quantidadeMaxima;
}

// ✅ Evento submit do formulário
document.getElementById('formAgendamento').addEventListener('submit', async (e) => {
  e.preventDefault();

  const botao = document.querySelector('#formAgendamento button[type="submit"]');
  botao.disabled = true;
  botao.textContent = 'Aguarde...';

  const { data, error } = await supabaseClient.auth.getUser();
  if (error || !data?.user) {
    alert("Usuário não autenticado.");
    botao.disabled = false;
    botao.textContent = 'Agendar';
    return;
  }

  const user = data.user;
  const servicoId = document.getElementById('tipoServico').value;
  const dataSelecionada = document.getElementById('input-data-agendamento').value;
  const periodoSelecionado = document.getElementById('periodo').value;
  const veiculo = document.getElementById('veiculo').value || null;
  const observacoes = document.getElementById('observacoes').value || null;

  if (!servicoId) {
    alert('Selecione um serviço.');
    botao.disabled = false;
    botao.textContent = 'Agendar';
    return;
  }

  if (!dataSelecionada) {
    alert('Selecione uma data.');
    botao.disabled = false;
    botao.textContent = 'Agendar';
    return;
  }

  if (!periodoSelecionado) {
    alert('Selecione um período.');
    botao.disabled = false;
    botao.textContent = 'Agendar';
    return;
  }

  if (await verificarDiaBloqueado(dataSelecionada)) {
    alert('Esta data está bloqueada. Escolha outro dia.');
    botao.disabled = false;
    botao.textContent = 'Agendar';
    return;
  }

  if (!await verificarLimitePorPeriodo(dataSelecionada, periodoSelecionado)) {
    alert(`Limite de agendamentos para o período "${periodoSelecionado}" atingido.`);
    botao.disabled = false;
    botao.textContent = 'Agendar';
    return;
  }

  const { data: agendamentosExistentes, error: buscaErro } = await supabaseClient
    .from('agendamentos')
    .select('*')
    .eq('data', dataSelecionada)
    .eq('periodo', periodoSelecionado)
    .eq('servico_id', servicoId);

  if (buscaErro) {
    console.error('Erro ao verificar duplicidade:', buscaErro);
    alert('Erro ao verificar disponibilidade.');
    botao.disabled = false;
    botao.textContent = 'Agendar';
    return;
  }

  if (agendamentosExistentes.length > 0) {
    alert('Já existe um agendamento para esta data, período e serviço.');
    botao.disabled = false;
    botao.textContent = 'Agendar';
    return;
  }

  const dados = {
    usuario_id: user.id,
    usuario_email: user.email,
    data: dataSelecionada,
    periodo: periodoSelecionado,
    servico_id: servicoId,
    veiculo,
    observacoes,
    status: "Pendente"
  };

  const { data: agendamentoInserido, error: insertError } = await supabaseClient
    .from('agendamentos')
    .insert([dados])
    .select('id')
    .single();

  if (insertError) {
    console.error('Erro ao criar agendamento:', insertError);
    alert('Erro ao criar agendamento.');
    botao.disabled = false;
    botao.textContent = 'Agendar';
    return;
  }

  alert('Agendamento criado com sucesso!');
  await enviarEmailAgendamento(agendamentoInserido.id);
  window.location.href = 'meus-agendamentos.html';
});

// ✅ Inicialização
window.onload = () => {
  verificarSessao();
  carregarServicos();

  const dataInput = document.getElementById('input-data-agendamento');
  const periodoSelect = document.getElementById('periodo');

  const atualizarVagas = () => {
    const dataSelecionada = dataInput.value;
    const periodoSelecionado = periodoSelect.value;
    carregarVagasRestantes(dataSelecionada, periodoSelecionado);
  };

  dataInput.addEventListener('change', atualizarVagas);
  periodoSelect.addEventListener('change', atualizarVagas);
};
