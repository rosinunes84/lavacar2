import { supabase } from "./supabase-config.js";

// CADASTRO
document.getElementById("btn-cadastrar")?.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const { error } = await supabase.auth.signUp({ email, password: senha });

  if (error) return alert("Erro: " + error.message);
  alert("Cadastro realizado! Verifique seu e-mail.");
});

// LOGIN
document.getElementById("btn-login")?.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) return alert("Erro: " + error.message);
  alert("Login realizado!");
  window.location.href = "index.html";
});
