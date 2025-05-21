// perfil.js - usando cliente oficial Supabase

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://kiqvzarmwooveklezzfm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjA0MTMsImV4cCI6MjA2MTYzNjQxM30.aW2IAN1xlL8HOZfKqZnGr-7Lw5Ay-AA4MwT-E7dK1A8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function buscarNomeUsuario(usuarioId) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('nome')
    .eq('id', usuarioId)
    .single();

  if (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }

  console.log('Nome do usuário:', data.nome);
  return data.nome;
}

const usuarioId = 'ec0bbefa-18b5-4d22-94fc-f9ddc36da92b';
buscarNomeUsuario(usuarioId);
