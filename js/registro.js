console.log('registro.js carregado');

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kiqvzarmwooveklezzfm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjA0MTMsImV4cCI6MjA2MTYzNjQxM30.aW2IAN1xlL8HOZfKqZnGr-7Lw5Ay-AA4MwT-E7dK1A8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Formulário de cadastro manual
const form = document.getElementById('signup-form');
const mensagem = document.getElementById('mensagem');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = form.nome.value.trim();
  const email = form.email.value.trim();
  const senha = form.senha.value.trim();

  if (!nome) {
    mensagem.textContent = 'Por favor, preencha o nome.';
    return;
  }

  mensagem.textContent = 'Cadastrando...';

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: senha,
  });

  if (error) {
    mensagem.textContent = `Erro ao cadastrar: ${error.message}`;
    return;
  }

  const user = data.user;

  if (user) {
    const { error: dbError } = await supabase
      .from('usuarios')
      .upsert([{ id: user.id, nome, email, role: 'cliente' }]);

    if (dbError) {
      mensagem.textContent = 'Erro ao salvar no banco: ' + dbError.message;
      return;
    }
  }

  mensagem.textContent = 'Usuário cadastrado com sucesso! Verifique seu email para confirmação.';
  form.reset();
});

// Função de login com Google (com redirecionamento para home.html)
export async function loginComGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/home.html'
    }
  });
}
