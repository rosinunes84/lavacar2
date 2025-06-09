import { auth } from './firebase-config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = "https://kiqvzarmwooveklezzfm.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjA0MTMsImV4cCI6MjA2MTYzNjQxM30.aW2IAN1xlL8HOZfKqZnGr-7Lw5Ay-AA4MwT-E7dK1A8";  // Substitua pela sua key do Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Elements
const loginSection = document.getElementById('login-section');
const agendamentoSection = document.getElementById('agendamento-section');

const btnLogin = document.getElementById('btn-login');
const loginMessage = document.getElementById('login-message');

const btnAgendar = document.getElementById('btn-agendar');
const agendamentoMessage = document.getElementById('agendamento-message');

const logoutBtn = document.getElementById('logout-btn');

btnLogin.addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  loginMessage.textContent = "";

  if (!email || !password) {
    loginMessage.textContent = "Preencha email e senha.";
    return;
  }

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    // Usuário logado
    showAgendamento();
  } catch (error) {
    loginMessage.textContent = "Erro no login: " + error.message;
  }
});

btnAgendar.addEventListener('click', async () => {
  agendamentoMessage.textContent = "";

  const user = auth.currentUser;
  if (!user) {
    alert("Você precisa estar logado.");
    showLogin();
    return;
  }

  const data = document.getElementById('data').value;
  const periodo = document.getElementById('periodo').value;
  const servico = document.getElementById('servico').value.trim();
  const veiculo = document.getElementById('veiculo').value.trim();

  if (!data || !periodo || !servico || !veiculo) {
    agendamentoMessage.style.color = "red";
    agendamentoMessage.textContent = "Preencha todos os campos.";
    return;
  }

  const { error } = await supabase.from('agendamentos').insert([{
    usuario_id: user.uid,
    email: user.email,
    data,
    periodo,
    servico,
    veiculo,
    status: "Pendente",
    created_at: new Date().toISOString(),
  }]);

  if (error) {
    agendamentoMessage.style.color = "red";
    agendamentoMessage.textContent = "Erro ao agendar: " + error.message;
    return;
  }

  agendamentoMessage.style.color = "green";
  agendamentoMessage.textContent = "Agendamento realizado com sucesso!";
  document.getElementById('form-agendamento').reset();
});

logoutBtn.addEventListener('click', async () => {
  await auth.signOut();
  showLogin();
});

function showLogin() {
  loginSection.style.display = "block";
  agendamentoSection.style.display = "none";
  loginMessage.textContent = "";
  agendamentoMessage.textContent = "";
}

function showAgendamento() {
  loginSection.style.display = "none";
  agendamentoSection.style.display = "block";
  loginMessage.textContent = "";
  agendamentoMessage.textContent = "";
}

// Verifica se usuário já está logado ao carregar a página
auth.onAuthStateChanged(user => {
  if (user) {
    showAgendamento();
  } else {
    showLogin();
  }
});
