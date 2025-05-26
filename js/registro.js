import { supabase } from './supabase-config.js';

document.getElementById('btn-registro').addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value.trim();
  const nome = document.getElementById('nome').value.trim();

  if (!email || !senha || !nome) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  // Cadastra usuário no Auth
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: senha
  });

  if (error) {
    alert('Erro no cadastro: ' + error.message);
    return;
  }

  if (data.user) {
    const user = data.user;

    // Insere dados na tabela usuarios
    const { error: insertError } = await supabase
      .from('usuarios')
      .insert([
        { id: user.id, nome: nome, role: 'authenticated' } // ajuste role se não existir na tabela
      ]);

    if (insertError) {
      console.error('Erro ao salvar nome:', insertError);
      alert('Erro ao salvar nome: ' + insertError.message);
      return;
    }

    alert('Registro realizado! Verifique seu e-mail.');
    window.location.href = 'login.html';
  }
});
