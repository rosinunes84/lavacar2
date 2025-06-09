import { supabase } from './supabase-client.js';

const form = document.getElementById('form-limite');
const listaLimites = document.getElementById('lista-limites');

async function carregarLimites() {
  const { data, error } = await supabase
    .from('quantidades_periodos')
    .select('*')
    .order('data', { ascending: true });

  listaLimites.innerHTML = '';

  if (error) {
    listaLimites.innerHTML = '<p>Erro ao carregar limites.</p>';
    console.error('Erro ao carregar limites:', error);
    return;
  }

  if (!data || data.length === 0) {
    listaLimites.innerHTML = '<p>Nenhum limite configurado.</p>';
    return;
  }

  data.forEach(limite => {
    const div = document.createElement('div');
    div.className = 'limite-card';
    div.innerHTML = `
      <p><strong>Data:</strong> ${limite.data}</p>
      <p><strong>Manhã:</strong> ${limite.limite_manha}</p>
      <p><strong>Tarde:</strong> ${limite.limite_tarde}</p>
      <p><strong>Noite:</strong> ${limite.limite_noite}</p>
      <p><strong>Bloqueado:</strong> ${limite.bloqueado ? 'Sim' : 'Não'}</p>
      <p><strong>Observação:</strong> ${limite.observacao || '-'}</p>
    `;
    listaLimites.appendChild(div);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const dataInput = document.getElementById('data').value;
  const limiteManha = parseInt(document.getElementById('limite_manha').value, 10);
  const limiteTarde = parseInt(document.getElementById('limite_tarde').value, 10);
  const limiteNoite = parseInt(document.getElementById('limite_noite').value, 10);
  const bloqueado = document.getElementById('bloqueado').checked;
  const observacao = document.getElementById('observacao').value.trim();

  if (!dataInput) {
    alert('Por favor, informe a data.');
    return;
  }
  if (isNaN(limiteManha) || isNaN(limiteTarde) || isNaN(limiteNoite)) {
    alert('Por favor, informe limites válidos.');
    return;
  }

  try {
    const { error } = await supabase
      .from('quantidades_periodos')
      .upsert(
        {
          data: dataInput,
          limite_manha: limiteManha,
          limite_tarde: limiteTarde,
          limite_noite: limiteNoite,
          bloqueado,
          observacao
        },
        { onConflict: ['data'] }  // MUITO IMPORTANTE: garante que atualize se já existir
      );

    if (error) {
      alert('Erro ao salvar: ' + error.message);
      console.error(error);
    } else {
      alert('Configuração salva com sucesso!');
      form.reset();
      carregarLimites();
    }
  } catch (error) {
    alert('Erro inesperado: ' + error.message);
    console.error(error);
  }
});

document.addEventListener('DOMContentLoaded', carregarLimites);
