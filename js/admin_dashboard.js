import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kiqvzarmwooveklezzfm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjA0MTMsImV4cCI6MjA2MTYzNjQxM30.aW2IAN1xlL8HOZfKqZnGr-7Lw5Ay-AA4MwT-E7dK1A8'; // Troque pela sua key real
const supabase = createClient(supabaseUrl, supabaseKey);

const listaAgendamentos = document.getElementById('lista-agendamentos');
const contadorHoje = document.getElementById('contador-hoje');
const contadorAmanha = document.getElementById('contador-amanha');

let usuarioAtual = null;
let isAdmin = false;

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

// Função para carregar dados do usuário logado e definir se é admin
async function carregarUsuarioAtual() {
  const { data: user, error } = await supabase.auth.getUser();
  if (error || !user) {
    console.error('Usuário não autenticado:', error);
    return;
  }
  usuarioAtual = user.user;

  // Pega o perfil do usuário para verificar se é admin (supondo que exista campo 'role' na tabela 'usuarios')
  const { data, error: errorPerfil } = await supabase
    .from('usuarios')
    .select('role')
    .eq('id', usuarioAtual.id)
    .limit(1);

  if (errorPerfil || !data || data.length === 0) {
    console.error('Erro ao buscar perfil do usuário:', errorPerfil);
    return;
  }

  isAdmin = data[0].role === 'admin';
}

// Função para excluir agendamento pelo id
async function excluirAgendamento(id) {
  if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

  const { error } = await supabase
    .from('agendamentos')
    .delete()
    .eq('id', id);

  if (error) {
    alert('Erro ao excluir agendamento: ' + error.message);
  } else {
    alert('Agendamento excluído com sucesso!');
    carregarAgendamentos();
  }
}

// Função para editar agendamento (redirecionar para página de edição com id na query string)
function editarAgendamento(id) {
  window.location.href = `editar-agendamento.html?id=${id}`;
}

async function carregarAgendamentos() {
  try {
    // Se for admin pega todos, senão só os do usuário logado
    let query = supabase
      .from('agendamentos')
      .select('*')
      .order('data', { ascending: false });

    if (!isAdmin && usuarioAtual) {
      query = query.eq('usuario_id', usuarioAtual.id);
    }

    const { data, error } = await query;

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
        <div class="acoes">
          <button class="btn-editar" data-id="${agendamento.id}">Editar</button>
          <button class="btn-excluir" data-id="${agendamento.id}">Excluir</button>
        </div>
        <hr/>
      `;
      listaAgendamentos.appendChild(div);
    }

    contadorHoje.textContent = `Agendamentos de hoje: ${totalHoje}`;
    contadorAmanha.textContent = `Agendamentos de amanhã: ${totalAmanha}`;

    // Adiciona eventos aos botões de editar e excluir
    document.querySelectorAll('.btn-excluir').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        excluirAgendamento(id);
      });
    });

    document.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        editarAgendamento(id);
      });
    });

  } catch (err) {
    console.error('Erro ao carregar agendamentos:', err);
    listaAgendamentos.innerHTML = '<p>Erro ao carregar agendamentos.</p>';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await carregarUsuarioAtual();
  await carregarAgendamentos();
});
