import { supabase } from "./supabase-config.js";

let usuarioID = null;

async function verificarSessao() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    alert("Você precisa estar logado.");
    window.location.href = "login.html";
  } else {
    usuarioID = data.session.user.id;
    console.log("Usuário logado:", usuarioID);
  }
}
verificarSessao();

document.getElementById("btn-agendar")?.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const data = document.getElementById("data").value;
  const periodo = document.getElementById("periodo").value;
  const servico = document.getElementById("servico").value;
  const veiculo = document.getElementById("veiculo").value;
  const { error } = await supabase.from("agendamentos").insert([{
    usuario_id: usuarioID,
    email,
    data,
    periodo,
    servico,
    veiculo,
    status: "Pendente"
  }]);

  if (error) {
    alert("Erro ao agendar: " + error.message);
  } else {
    alert("Agendamento realizado com sucesso!");
    document.getElementById("form-agendamento").reset();
  }
});
