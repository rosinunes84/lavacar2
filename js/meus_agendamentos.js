console.log("✅ Página Meus Agendamentos carregada");

// ✅ Inicializa o Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kiqvzarmwooveklezzfm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtdm9vdmVrbGV6emZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjA0MTMsImV4cCI6MjA2MTYzNjQxM30.aW2IAN1xlL8HOZfKqZnGr-7Lw5Ay-AA4MwT-E7dK1A8';
const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ Verifica se o usuário está logado
async function verificarSessao() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.warn("⚠️ Usuário não logado, redirecionando para login.");
    window.location.href = "index.html";
    return;
  }

  const usuarioID = user.id;
  console.log("👤 Usuário logado:", usuarioID);

  carregarAgendamentos(usuarioID);
}

// ✅ Carrega e exibe os agendamentos do usuário
async function carregarAgendamentos(usuarioID) {
  const { data, error } = await supabase
    .from('agendamentos')
    .select(`
      *,
      servicos:servico_id (nome)
    `)
    .eq('usuario_id', usuarioID)
    .order('data', { ascending: true });

  if (error) {
    console.error("❌ Erro ao buscar agendamentos:", error);
    return;
  }

  const lista = document.getElementById("listaAgendamentos");
  lista.innerHTML = '';

  if (!data || data.length === 0) {
    lista.innerHTML = "<p>Nenhum agendamento encontrado.</p>";
    console.log("ℹ️ Nenhum agendamento encontrado.");
    return;
  }

  console.log(`✅ ${data.length} agendamento(s) encontrado(s).`);

  data.forEach(agendamento => {
    const nomeServico = agendamento.servicos?.nome || 'Serviço não informado';
    const veiculo = agendamento.veiculo || 'Não informado';

    const item = document.createElement("div");
    item.className = "agendamento-item";
    item.innerHTML = `
      <p><strong>Data:</strong> ${agendamento.data}</p>
      <p><strong>Período:</strong> ${agendamento.periodo}</p>
      <p><strong>Serviço:</strong> ${nomeServico}</p>
      <p><strong>Veículo:</strong> ${veiculo}</p>
      <p><strong>Status:</strong> ${agendamento.status}</p>
    `;
    lista.appendChild(item);
  });
}

// ✅ Cria o botão flutuante "Ir para o topo"
function criarBotaoTopo() {
  const botao = document.createElement("button");
  botao.textContent = "⬆️ Ir para o topo";
  botao.style.position = "fixed";
  botao.style.bottom = "20px";
  botao.style.right = "20px";
  botao.style.padding = "12px 20px";
  botao.style.background = "#007BFF";
  botao.style.color = "#fff";
  botao.style.border = "none";
  botao.style.borderRadius = "50px";
  botao.style.cursor = "pointer";
  botao.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
  botao.style.zIndex = "1000";
  botao.style.fontSize = "14px";

  botao.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.body.appendChild(botao);
}

// ✅ Executa as funções principais
verificarSessao();
criarBotaoTopo();
