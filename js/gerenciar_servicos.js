// js/gerenciar_servicos.js
import { supabase } from './supabase-config.js';

const listaServicos = document.getElementById('listaServicos');

export async function carregarServicos() {
  const { data, error } = await supabase.from('servicos').select('*');
  if (error) return alert("Erro ao carregar serviços");

  listaServicos.innerHTML = "";

  data.forEach((servico) => {
    const linha = document.createElement("tr");

    linha.innerHTML = `
      <td><input type="text" value="${servico.nome}" onchange="editarCampo(${servico.id}, 'nome', this.value)" /></td>
      <td><input type="number" value="${servico.preco}" onchange="editarCampo(${servico.id}, 'preco', this.value)" /></td>
      <td><button onclick="excluirServico(${servico.id})">Excluir</button></td>
    `;

    listaServicos.appendChild(linha);
  });
}

export async function adicionarServico() {
  const nome = document.getElementById('nomeServico').value;
  const preco = parseFloat(document.getElementById('precoServico').value);

  if (!nome || isNaN(preco)) {
    return alert("Preencha nome e preço válidos");
  }

  const { error } = await supabase.from('servicos').insert([{ nome, preco }]);
  if (error) return alert("Erro ao adicionar serviço");

  document.getElementById('nomeServico').value = "";
  document.getElementById('precoServico').value = "";
  carregarServicos();
}

window.editarCampo = async function(id, campo, valor) {
  const { error } = await supabase
    .from('servicos')
    .update({ [campo]: valor })
    .eq('id', id);

  if (error) alert("Erro ao atualizar serviço");
}

window.excluirServico = async function(id) {
  if (!confirm("Tem certeza que deseja excluir?")) return;

  const { error } = await supabase.from('servicos').delete().eq('id', id);
  if (error) return alert("Erro ao excluir serviço");

  carregarServicos();
}

carregarServicos();
