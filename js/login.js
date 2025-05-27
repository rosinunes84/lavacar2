import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kiqvzarmwooveklezzfm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjA0MTMsImV4cCI6MjA2MTYzNjQxM30.aW2IAN1xlL8HOZfKqZnGr-7Lw5Ay-AA4MwT-E7dK1A8'; // mantenha sua chave correta
const supabase = createClient(supabaseUrl, supabaseKey);

async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert('Erro no login: ' + error.message);
    return;
  }

  const user = data.user;

  if (!user) {
    alert('Usuário não encontrado após login.');
    return;
  }

  console.log('ID do usuário logado:', user.id);

  const { data: userData, error: userError } = await supabase
    .from('usuarios')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userError) {
    alert('Erro ao buscar perfil do usuário: ' + userError.message);
    await supabase.auth.signOut();
    return;
  }

  if (!userData || userData.role !== 'admin') {
    alert('Você não tem permissão para acessar o painel administrativo.');
    await supabase.auth.signOut();
    return;
  }

  // Usuário é admin, redireciona
  window.location.href = 'admin_dashboard.html';
}

document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  await login(email, password);
});
