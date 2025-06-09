// server.js
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 Substitua com as suas credenciais da Supabase
const supabase = createClient(
  'https://kiqvzarmwooveklezzfm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjA2MDQxMywiZXhwIjoyMDYxNjM2NDEzfQ.dgCI4FpEqGcAeWtgVvd80WjG6v9H26Wq0E8Gp3RKZ-c' // precisa ser a chave service_role para criar usuários
);

// 🛡️ Configurar CORS
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'https://townpark.netlify.app'], // coloque os domínios permitidos
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// 🧩 Middleware para JSON
app.use(express.json());

// ✅ Rota de cadastro
app.post('/cadastrar', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
  }

  try {
    // 🔐 Criar usuário no Auth
    const { data: userData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true
    });

    if (authError) {
      return res.status(400).json({ error: 'Erro ao criar usuário: ' + authError.message });
    }

    const userId = userData.user.id;

    // 💾 Inserir no banco
    const { error: dbError } = await supabase
      .from('usuarios')
      .upsert([{ id: userId, nome, email, role: 'cliente' }]);

    if (dbError) {
      return res.status(500).json({ error: 'Erro ao inserir no banco: ' + dbError.message });
    }

    res.json({ message: 'Usuário criado com sucesso!' });
  } catch (e) {
    res.status(500).json({ error: 'Erro interno: ' + e.message });
  }
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
