console.log('perfil.js carregado');

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kiqvzarmwooveklezzfm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjA0MTMsImV4cCI6MjA2MTYzNjQxM30.aW2IAN1xlL8HOZfKqZnGr-7Lw5Ay-AA4MwT-E7dK1A8';
const supabase = createClient(supabaseUrl, supabaseKey);

const perfil = document.getElementById('perfil');

async function carregarPerfil() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      perfil.textContent = 'Nenhum usuário logado.';
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      perfil.textContent = 'Erro ao obter sessão do usuário.';
      console.error('Erro na sessão:', sessionError);
      return;
    }

    const accessToken = sessionData.session.access_token;

    const url = `${supabaseUrl}/rest/v1/usuarios?select=nome,email,role&id=eq.${user.id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      perfil.textContent = `Erro ao carregar perfil: ${response.status}`;
      console.error('Erro na resposta:', response.statusText);
      return;
    }

    const perfilData = await response.json();

    if (!perfilData || perfilData.length === 0) {
      perfil.textContent = `Usuário logado: ${user.email} | Perfil não encontrado.`;
      return;
    }

    const { nome, email, role } = perfilData[0];

    perfil.textContent = `Usuário: ${nome || 'Não informado'} | Email: ${email || user.email} | Role: ${role || 'Não definida'}`;

  } catch (error) {
    perfil.textContent = 'Erro ao carregar perfil.';
    console.error('Erro geral:', error);
  }
}

carregarPerfil();
