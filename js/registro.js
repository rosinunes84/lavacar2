console.log('registro.js carregado');
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kiqvzarmwooveklezzfm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjA0MTMsImV4cCI6MjA2MTYzNjQxM30.aW2IAN1xlL8HOZfKqZnGr-7Lw5Ay-AA4MwT-E7dK1A8'; // mantém a sua key

const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById('signup-form');
const mensagem = document.getElementById('mensagem');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = form.nome.value.trim();
  const email = form.email.value.trim();
  const senha = form.senha.value.trim();

  mensagem.textContent = 'Cadastrando...';

  // 1) Cadastra usuário na autenticação do Supabase com email e senha do formulário
  const { user, error: signUpError } = await supabase.auth.signUp({
    email: email,
    password: senha,
  });

  if (signUpError) {
    mensagem.textContent = `Erro ao cadastrar: ${signUpError.message}`;
    return;
  }

  if (user) {
    // 2) Insere dados do usuário na tabela 'usuarios'
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ id: user.id, nome: nome, email: user.email, is_admin: false, role: 'user' }]);

    if (error) {
      mensagem.textContent = `Erro ao salvar dados do usuário: ${error.message}`;
      return;
    }
  }

  mensagem.textContent = 'Usuário cadastrado com sucesso! Verifique seu email para confirmação.';
  form.reset();
});
