import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kiqvzarmwooveklezzfm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjA0MTMsImV4cCI6MjA2MTYzNjQxM30.aW2IAN1xlL8HOZfKqZnGr-7Lw5Ay-AA4MwT-E7dK1A8';
const supabase = createClient(supabaseUrl, supabaseKey);

const listaAgendamentos = document.getElementById('lista-agendamentos');
const contadorHoje = document.getElementById('contador-hoje');
const contadorAmanha = document.getElementById('contador-amanha');

// Busca nome do usuário pelo ID (com .limit(1) para evitar erro 406)
async function getNomeUsuario(usuarioId) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('nome')
      .eq('id', usuarioId)
      .limit(1);

    if (error) {
      console.error('Erro ao buscar usuário:', error);
      return 'N/A';
    }

    if (data && data.length > 0) {
      return data[0].nome;
    } else {
      return 'N/A';
    }
  } catch (err) {
    console.error('Erro inesperado ao buscar usuário:', err);
    return 'N/A';
  }
}

async function carregarAgendamentos() {
  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .order('data', { ascending: false });

    if (error) throw error;

    listaAgendamentos.innerHTML = '';

    const hoje = new Date().toISOString().split('T')[0];
    const amanha = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    let totalHoje = 0;
    let totalAmanha = 0;

    for (const agendamento of data) {
      const dataAgendamento = agendamento.data;
      const nomeUsuario = await getNomeUsuario(agendamento.usuario_id);

      if (dataAgendamento === hoje) totalHoje++;
      if (dataAgendamento === amanha) totalAmanha++;

      const div = document.createElement('div');
      div.className = 'agendamento';
      div.innerHTML = `
        <strong>Serviço:</strong> ${agendamento.tipo_servico || 'N/A'}<br/>
        <strong>Veículo:</strong> ${agendamento.veiculo || 'N/A'}<br/>
        <strong>Horário:</strong> ${agendamento.periodo || 'N/A'}<br/>
        <strong>Data:</strong> ${agendamento.data}<br/>
        <strong>Usuário:</strong> ${nomeUsuario}<br/>
        <hr/>
      `;
      listaAgendamentos.appendChild(div);
    }

    contadorHoje.textContent = `Agendamentos de hoje: ${totalHoje}`;
    contadorAmanha.textContent = `Agendamentos de amanhã: ${totalAmanha}`;

  } catch (err) {
    console.error('Erro ao carregar agendamentos:', err);
    listaAgendamentos.innerHTML = '<p>Erro ao carregar agendamentos.</p>';
  }
}

document.addEventListener('DOMContentLoaded', carregarAgendamentos);
