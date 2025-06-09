import { supabase } from "./supabase-config.js";

const listaServicos = document.getElementById("listaServicos");
const btnAdicionarServico = document.getElementById("btnAdicionarServico");
const inputNome = document.getElementById("nomeServico");
const inputPreco = document.getElementById("precoServico");

// Carregar e exibir os serviços cadastrados
async function carregarServicos() {
  const { data: servicos, error } = await supabase
    .from("servicos")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    alert("Erro ao carregar serviços: " + error.message);
    return;
  }

  listaServicos.innerHTML = "";

  servicos.forEach((servico) => {
    const tr = document.createElement("tr");
    tr.dataset.id = servico.id;

    tr.innerHTML = `
      <td class="nome-servico">${servico.nome}</td>
      <td class="preco-servico">R$ ${Number(servico.preco).toFixed(2)}</td>
      <td>
        <button class="btn-editar">Editar</button>
        <button class="btn-excluir">Excluir</button>
      </td>
    `;

    listaServicos.appendChild(tr);
  });

  adicionarEventosAcoes();
}

// Adicionar novo serviço
async function adicionarServico() {
  const nome = inputNome.value.trim();
  const preco = parseFloat(inputPreco.value);

  if (!nome) {
    alert("Informe o nome do serviço.");
    return;
  }

  if (isNaN(preco) || preco < 0) {
    alert("Informe um preço válido.");
    return;
  }

  btnAdicionarServico.disabled = true;
  btnAdicionarServico.textContent = "Adicionando...";

  const { error } = await supabase.from("servicos").insert([{ nome, preco }]);

  if (error) {
    alert("Erro ao adicionar serviço: " + error.message);
  } else {
    alert("Serviço adicionado com sucesso!");
    inputNome.value = "";
    inputPreco.value = "";
    carregarServicos();
  }

  btnAdicionarServico.disabled = false;
  btnAdicionarServico.textContent = "Adicionar Serviço";
}

// Excluir serviço
async function excluirServico(id) {
  if (!confirm("Deseja realmente excluir este serviço?")) return;

  const { error } = await supabase.from("servicos").delete().eq("id", id);

  if (error) {
    alert("Erro ao excluir serviço: " + error.message);
  } else {
    alert("Serviço excluído com sucesso!");
    carregarServicos();
  }
}

// Editar serviço: transforma linha em inputs
function editarServico(tr) {
  const nomeTd = tr.querySelector(".nome-servico");
  const precoTd = tr.querySelector(".preco-servico");
  const acoesTd = tr.querySelector("td:last-child");

  const nomeAtual = nomeTd.textContent;
  const precoAtual = precoTd.textContent.replace("R$ ", "").replace(",", ".");

  nomeTd.innerHTML = `<input type="text" class="input-edit-nome" value="${nomeAtual}" />`;
  precoTd.innerHTML = `<input type="number" class="input-edit-preco" min="0" step="0.01" value="${precoAtual}" />`;

  acoesTd.innerHTML = `
    <button class="btn-salvar">Salvar</button>
    <button class="btn-cancelar">Cancelar</button>
  `;

  acoesTd.querySelector(".btn-salvar").addEventListener("click", () => salvarEdicao(tr));
  acoesTd.querySelector(".btn-cancelar").addEventListener("click", () => carregarServicos());
}

// Salvar edição no banco
async function salvarEdicao(tr) {
  const id = tr.dataset.id;
  const nomeInput = tr.querySelector(".input-edit-nome");
  const precoInput = tr.querySelector(".input-edit-preco");

  const nome = nomeInput.value.trim();
  const preco = parseFloat(precoInput.value);

  if (!nome) {
    alert("Informe o nome do serviço.");
    return;
  }

  if (isNaN(preco) || preco < 0) {
    alert("Informe um preço válido.");
    return;
  }

  const { error } = await supabase
    .from("servicos")
    .update({ nome, preco })
    .eq("id", id);

  if (error) {
    alert("Erro ao salvar edição: " + error.message);
  } else {
    alert("Serviço atualizado com sucesso!");
    carregarServicos();
  }
}

// Adicionar eventos nos botões de cada linha
function adicionarEventosAcoes() {
  const btnsExcluir = document.querySelectorAll(".btn-excluir");
  btnsExcluir.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const tr = e.target.closest("tr");
      excluirServico(tr.dataset.id);
    });
  });

  const btnsEditar = document.querySelectorAll(".btn-editar");
  btnsEditar.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const tr = e.target.closest("tr");
      editarServico(tr);
    });
  });
}

// Evento para adicionar serviço
btnAdicionarServico.addEventListener("click", adicionarServico);

// Carregar serviços ao abrir a página
carregarServicos();
