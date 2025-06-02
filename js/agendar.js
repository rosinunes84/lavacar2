const supabaseClient = supabase.createClient(
  'https://kiqvzarmwooveklezzfm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjA0MTMsImV4cCI6MjA2MTYzNjQxM30.aW2IAN1xlL8HOZfKqZnGr-7Lw5Ay-AA4MwT-E7dK1A8'
);

async function verificarSessao() {
  const { data, error } = await supabaseClient.auth.getUser();
  if (error || !data?.user) {
    window.location.href = 'index.html';
  }
}

async function enviarEmailAgendamento(agendamentoId) {
  try {
    // Buscar agendamento
    const { data: agendamento, error: agendamentoError } = await supabaseClient
      .from('agendamentos')
      .select('*')
      .eq('id', agendamentoId)
      .single();

    if (agendamentoError) {
      console.error('❌ Erro ao buscar agendamento:', agendamentoError);
      return;
    }

    // Buscar usuário
    const { data: usuario, error: usuarioError } = await supabaseClient
      .from('usuarios')
      .select('nome')
      .eq('id', agendamento.usuario_id)
      .single();

    if (usuarioError) {
      console.error('❌ Erro ao buscar usuário:', usuarioError);
      return;
    }

    // Buscar serviço
    const { data: servico, error: servicoError } = await supabaseClient
      .from('servicos')
      .select('nome')
      .eq('id', agendamento.servico_id)
      .single();

    if (servicoError) {
      console.error('❌ Erro ao buscar serviço:', servicoError);
      return;
    }

    const dataObj = new Date(agendamento.data);
    const dataFormatada = `${String(dataObj.getDate()).padStart(2, '0')}/${String(dataObj.getMonth() + 1).padStart(2, '0')}/${dataObj.getFullYear()}`;

    const emailParams = {
      usuario_nome: usuarios.nome || 'Nome não informado',
      servico_nome: servicos.nome || 'Serviço não informado',
      data: dataFormatada,
      periodo: agendamentos.periodo || 'Período não informado',
      veiculo: agendamentos.veiculo || 'Não informado'
    };

    console.log('➡️ Enviando e-mail com os seguintes parâmetros:', emailParams);

    await emailjs.send("service_n2fghu7", "template_eioflwb", emailParams);

    console.log('✅ E-mail enviado ao admin com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao enviar e-mail:', err);
  }
}

async function sair() {
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}

async function carregarServicos() {
  const select = document.getElementById('tipoServico');
  select.innerHTML = '<option value="">Carregando serviços...</option>';

  const { data: servicos, error } = await supabaseClient
    .from('servicos')
    .select('id, nome')
    .order('nome', { ascending: true });

  if (error) {
    alert('Erro ao carregar serviços: ' + error.message);
    select.innerHTML = '<option value="">Erro ao carregar serviços</option>';
    return;
  }

  if (!servicos || servicos.length === 0) {
    select.innerHTML = '<option value="">Nenhum serviço disponível</option>';
    return;
  }

  select.innerHTML = '<option value="">Selecione</option>';
  servicos.forEach(servico => {
    const option = document.createElement('option');
    option.value = servico.id;
    option.textContent = servico.nome;
    select.appendChild(option);
  });
}

document.getElementById('formAgendamento').addEventListener('submit', async (e) => {
  e.preventDefault();

  const { data, error } = await supabaseClient.auth.getUser();
  if (error || !data?.user) {
    alert("Usuário não autenticado.");
    return;
  }

  const user = data.user;
  const servicoId = document.getElementById('tipoServico').value;

  if (!servicoId) {
    alert('Por favor, selecione um serviço.');
    return;
  }

  const dados = {
    usuario_id: user.id,
    usuario_email: user.email,
    data: document.getElementById('data').value,
    periodo: document.getElementById('periodo').value,
    servico_id: servicoId,
    veiculo: document.getElementById('veiculo').value || null,
    observacoes: document.getElementById('observacoes').value || null,
    status: "Pendente"
  };

  console.log("📝 Dados para enviar:", dados);

  const { data: agendamentoInserido, error: insertError } = await supabaseClient
    .from('agendamentos')
    .insert([dados])
    .select('id')
    .single();

  if (insertError) {
    alert('Erro ao agendar: ' + insertError.message);
    console.error(insertError);
  } else {
    await enviarEmailAgendamento(agendamentoInserido.id);
    alert('✅ Agendamento realizado com sucesso!');
    window.location.href = 'meus-agendamentos.html';
  }
});

verificarSessao();
carregarServicos();
