console.log('perfil.js carregado');

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kiqvzarmwooveklezzfm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjA0MTMsImV4cCI6MjA2MTYzNjQxM30.aW2IAN1xlL8HOZfKqZnGr-7Lw5Ay-AA4MwT-E7dK1A8';
const supabase = createClient(supabaseUrl, supabaseKey);

const perfil = document.getElementById('perfil');

async function carregarPerfil() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    perfil.textContent = 'Nenhum usuário logado.';
    return;
  }

  const { data, error: selectError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single();

  if (selectError || !data) {
    perfil.textContent = `Usuário logado: ${user.email} | Perfil não encontrado.`;
    return;
  }

  perfil.textContent = `Usuário: ${data.nome} | Email: ${data.email} | Role: ${data.role}`;
}

carregarPerfil();
