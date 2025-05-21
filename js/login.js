import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kiqvzarmwooveklezzfm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjA0MTMsImV4cCI6MjA2MTYzNjQxM30.aW2IAN1xlL8HOZfKqZnGr-7Lw5Ay-AA4MwT-E7dK1A8'; // substitua pela sua chave correta
const supabase = createClient(supabaseUrl, supabaseKey);

async function login(email, password) {
  const { data: session, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
  if (loginError) {
    alert('Erro no login: ' + loginError.message);
    return;
  }

  const userId = session.user.id;
const { data: { user } } = await supabase.auth.getUser();
console.log('ID do usuário logado:', user.id);

  const { data: userData, error: userError } = await supabase
    .from('usuarios')
    .select('role')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    alert('Erro ao buscar dados do usuário.');
    await supabase.auth.signOut();
    return;
  }

  if (userData.role !== 'admin') {
    alert('Você não tem permissão para acessar o painel administrativo.');
    await supabase.auth.signOut();
    return;
  }

  // Admin autorizado — redireciona para o painel
  window.location.href = 'admin_dashboard.html';
}

document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  await login(email, password);
});
