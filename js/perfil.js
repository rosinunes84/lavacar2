import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://kiqvzarmwooveklezzfm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjA0MTMsImV4cCI6MjA2MTYzNjQxM30.aW2IAN1xlL8HOZfKqZnGr-7Lw5Ay-AA4MwT-E7dK1A8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function carregarPerfil() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('Erro ao obter usuário autenticado:', userError);
  }

  if (!user) {
    alert('Você precisa estar logado.');
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('email').textContent = user.email;

  const { data, error } = await supabase
    .from('usuarios')
    .select('nome, role')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    document.getElementById('nome').textContent = 'Erro ao carregar nome';
    document.getElementById('role').textContent = 'Erro ao carregar função';
    return;
  }

  console.log('Dados do usuário da tabela "usuarios":', data);

  // Se nome estiver vazio ou null, tenta usar user.user_metadata ou outro dado
  let nome = data.nome;
  if (!nome || nome.trim() === '') {
    // Tenta pegar do user_metadata (caso exista)
    nome = user.user_metadata?.full_name || user.user_metadata?.nome || 'Nome não disponível';
  }

  document.getElementById('nome').textContent = nome;
  document.getElementById('role').textContent = data.role || 'Função não definida';
}
