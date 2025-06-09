console.log('login.js carregado');

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kiqvzarmwooveklezzfm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjA0MTMsImV4cCI6MjA2MTYzNjQxM30.aW2IAN1xlL8HOZfKqZnGr-7Lw5Ay-AA4MwT-E7dK1A8';
const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById('login-form');
const mensagem = document.getElementById('mensagem');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = form.nome.value.trim();
  const email = form.email.value.trim();
  const senha = form.senha.value.trim();

  if (!email || !senha) {
    mensagem.textContent = 'Preencha email e senha.';
    return;
  }

  mensagem.textContent = 'Logando...';

  try {
    // Autenticação
    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (loginError || !user) {
      mensagem.textContent = `Erro ao logar: ${loginError?.message || 'Usuário não encontrado'}`;
      return;
    }

    mensagem.textContent = 'Login realizado com sucesso!';

    // Edge Function: garantir criação de perfil
    const { error: funcError } = await supabase.functions.invoke('create_user_profile', {
      body: { nome }
    });

    if (funcError) {
      mensagem.textContent += ` | Erro ao criar perfil: ${funcError.message}`;
      return;
    }

    // Verifica se já existe perfil
    const { data: perfilExistente, error: selectError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      mensagem.textContent += ` | Erro ao buscar perfil: ${selectError.message}`;
      return;
    }

    if (!perfilExistente) {
      // Cria perfil
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert([{
          id: user.id,
          nome: nome || 'Usuário não informado',
          email: user.email,
          is_admin: false,
          role: 'user'
        }]);

      if (insertError) {
        mensagem.textContent += ` | Erro ao salvar perfil: ${insertError.message}`;
        return;
      }

      mensagem.textContent += ' | Perfil criado com sucesso!';
    } else {
      mensagem.textContent += ' | Perfil já existe!';
    }

  } catch (err) {
    console.error('Erro inesperado:', err);
    mensagem.textContent = `Erro inesperado: ${err.message}`;
  }
});
