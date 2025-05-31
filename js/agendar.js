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

  const { data: servicoData, error: servicoError } = await supabaseClient
    .from('servicos')
    .select('nome')
    .eq('id', servicoId)
    .single();

  if (servicoError) {
    alert('Erro ao buscar nome do serviço: ' + servicoError.message);
    return;
  }

  const nomeServico = servicoData?.nome;
  if (!nomeServico) {
    alert('Erro: nome do serviço não encontrado.');
    return;
  }

  const dados = {
    usuario_id: user.id,
    data: document.getElementById('data').value,
    periodo: document.getElementById('periodo').value,
    servico_id: servicoId,
    tipo_servico: nomeServico,
    veiculo: document.getElementById('veiculo').value || null,
    observacoes: document.getElementById('observacoes').value || null,
    status: "Pendente"
  };

  console.log("Dados para enviar:", dados);

  const { error: insertError } = await supabaseClient
    .from('agendamentos')
    .insert([dados]);

  if (insertError) {
    alert('Erro ao agendar: ' + insertError.message);
    console.error(insertError);
  } else {
    alert('Agendamento realizado com sucesso!');
    window.location.href = 'meus-agendamentos.html';
  }
});

verificarSessao();
carregarServicos();
