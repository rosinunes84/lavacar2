console.log("Página Meus Agendamentos carregada");

// Inicializa o Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kiqvzarmwooveklezzfm.supabase.co'; // substitua pelo seu URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjA0MTMsImV4cCI6MjA2MTYzNjQxM30.aW2IAN1xlL8HOZfKqZnGr-7Lw5Ay-AA4MwT-E7dK1A8'; // substitua pela sua chave anon
const supabase = createClient(supabaseUrl, supabaseKey);

// Verifica o usuário logado
async function verificarSessao() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        console.log("Usuário não logado, redirecionando para login.");
        window.location.href = "index.html";
        return;
    }

    const usuarioID = user.id;
    console.log("Usuário logado:", usuarioID);

    carregarAgendamentos(usuarioID);
}

async function carregarAgendamentos(usuarioID) {
    const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('usuario_id', usuarioID);

    if (error) {
        console.error("Erro ao buscar agendamentos:", error);
        return;
    }

    const lista = document.getElementById("listaAgendamentos");
    lista.innerHTML = '';

    if (data.length === 0) {
        lista.innerHTML = "<p>Nenhum agendamento encontrado.</p>";
        return;
    }

    data.forEach(agendamento => {
        const item = document.createElement("div");
        item.className = "agendamento-item";
        item.innerHTML = `
            <p><strong>Data:</strong> ${agendamento.data}</p>
            <p><strong>Período:</strong> ${agendamento.periodo}</p>
            <p><strong>Serviço:</strong> ${agendamento.servico}</p>
            <p><strong>Status:</strong> ${agendamento.status}</p>
            <hr>
        `;
        lista.appendChild(item);
    });
}

verificarSessao();
