import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'https://kiqvzarmwooveklezzfm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjA0MTMsImV4cCI6MjA2MTYzNjQxM30.aW2IAN1xlL8HOZfKqZnGr-7Lw5Ay-AA4MwT-E7dK1A8'
const supabase = createClient(supabaseUrl, supabaseKey)

const listaUsuarios = document.getElementById('lista-usuarios')

// Função para criar spinner de carregamento
function mostrarLoading() {
  listaUsuarios.innerHTML = '<p class="loading">Carregando usuários...</p>'
}

// Carregar lista de usuários
async function carregarUsuarios() {
  mostrarLoading()

  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao carregar usuários:', error)
    listaUsuarios.innerHTML = `<p class="error">Erro: ${error.message}</p>`
    return
  }

  if (!data || data.length === 0) {
    listaUsuarios.innerHTML = `<p class="empty">Nenhum usuário encontrado.</p>`
    return
  }

  listaUsuarios.innerHTML = ''
  data.forEach(usuario => {
    const card = document.createElement('div')
    card.className = 'usuario-card'

    card.innerHTML = `
      <p><strong>👤 Nome:</strong> ${usuario.nome || 'N/A'}</p>
      <p><strong>📧 Email:</strong> ${usuario.email || 'N/A'}</p>
      <p><strong>📞 Telefone:</strong> ${usuario.telefone || 'N/A'}</p>
      <p><strong>🔑 Admin:</strong> ${usuario.is_admin ? '✅ Sim' : '❌ Não'}</p>
      <button class="btn-excluir">🗑️ Excluir</button>
    `

    const btnExcluir = card.querySelector('.btn-excluir')
    btnExcluir.addEventListener('click', () => excluirUsuario(usuario.id, card))

    listaUsuarios.appendChild(card)
  })
}

// Excluir usuário
window.excluirUsuario = async function (id, card) {
  const confirmar = confirm('❓ Deseja realmente excluir este usuário?')
  if (!confirmar) return

  card.classList.add('loading')

  const { error } = await supabase
    .from('usuarios')
    .delete()
    .eq('id', id)

  if (error) {
    alert('❌ Erro ao excluir usuário: ' + error.message)
    card.classList.remove('loading')
  } else {
    alert('✅ Usuário excluído com sucesso!')
    card.remove()
    if (listaUsuarios.children.length === 0) {
      listaUsuarios.innerHTML = `<p class="empty">Nenhum usuário encontrado.</p>`
    }
  }
}

// Inicializa carregamento
carregarUsuarios()
