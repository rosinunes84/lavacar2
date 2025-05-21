import { supabase } from './supabase-config.js';

document.getElementById('btn-registro').addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value.trim();
  const nome = document.getElementById('nome').value.trim();

  const { data, error } = await supabase.auth.signUp({ email, password: senha });

  if (error) {
    alert('Erro ao registrar: ' + error.message);
    return;
  }

  const userId = data.user?.id;

  if (!userId) {
    alert("Erro: ID do usuário não encontrado.");
    return;
  }

  // Inserir na tabela "usuarios"
  const { error: insertError } = await supabase
    .from('usuarios')
    .insert([{ id: userId, nome }]);

  if (insertError) {
    alert('Erro ao salvar nome: ' + insertError.message);
    return;
  }

  alert('Registro realizado! Verifique seu e-mail.');
  window.location.href = 'login.html';
});
