import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'https://kiqvzarmwooveklezzfm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjA0MTMsImV4cCI6MjA2MTYzNjQxM30.aW2IAN1xlL8HOZfKqZnGr-7Lw5Ay-AA4MwT-E7dK1A8'
const supabase = createClient(supabaseUrl, supabaseKey)

const listaUsuarios = document.getElementById('lista-usuarios')

// Carregar lista de usuários
async function carregarUsuarios() {
  console.log('Carregando usuários...')
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('nome', { ascending: true })

  console.log('Dados recebidos:', data)  // <<< LOG AQUI

  if (error) {
    console.error('Erro ao carregar usuários:', error)
    listaUsuarios.innerHTML = `<p>Erro: ${error.message}</p>`
    return
  }

  if (!data || data.length === 0) {
    listaUsuarios.innerHTML = `<p>Nenhum usuário encontrado.</p>`
    return
  }

  listaUsuarios.innerHTML = ''
  data.forEach(usuario => {
    const card = document.createElement('div')
    card.className = 'usuario-card'

    card.innerHTML = `
      <p><strong>Nome:</strong> ${usuario.nome || 'N/A'}</p>
      <p><strong>Email:</strong> ${usuario.email || 'N/A'}</p>
      <p><strong>Telefone:</strong> ${usuario.telefone || 'N/A'}</p>
      <p><strong>Admin:</strong> ${usuario.is_admin ? 'Sim' : 'Não'}</p>
      <button class="btn-excluir">Excluir</button>
      <button class="btn-editar">Editar</button>
    `

    const btnExcluir = card.querySelector('.btn-excluir')
    btnExcluir.addEventListener('click', () => excluirUsuario(usuario.id))

    const btnEditar = card.querySelector('.btn-editar')
    btnEditar.addEventListener('click', () => {
      abrirFormulario(usuario.id, usuario.nome || '', usuario.telefone || '', usuario.is_admin)
    })

    listaUsuarios.appendChild(card)
  })
}


// Excluir usuário
window.excluirUsuario = async function (id) {
  const confirmar = confirm('Deseja realmente excluir este usuário?')
  if (!confirmar) return

  console.log('Excluindo usuário com id:', id)
  const { error } = await supabase
    .from('usuarios')
    .delete()
    .eq('id', id)

  if (error) {
    alert('Erro ao excluir usuário: ' + error.message)
  } else {
    alert('Usuário excluído com sucesso!')
    carregarUsuarios()
  }
}

// Abrir formulário de edição
window.abrirFormulario = function (id, nome, telefone, is_admin) {
  console.log('Abrindo formulário para:', { id, nome, telefone, is_admin })
  const modal = document.getElementById('modal-edicao')
  document.getElementById('edit-id').value = id
  document.getElementById('edit-nome').value = nome
  document.getElementById('edit-telefone').value = telefone
  document.getElementById('edit-admin').checked = is_admin
  modal.style.display = 'flex'
}

// Fechar modal
window.fecharModal = function () {
  document.getElementById('modal-edicao').style.display = 'none'
}

// Salvar alterações
window.salvarAlteracoes = async function () {
  const id = document.getElementById('edit-id').value
  const nome = document.getElementById('edit-nome').value
  const telefone = document.getElementById('edit-telefone').value
  const is_admin = document.getElementById('edit-admin').checked

  console.log('Salvando alterações:', { id, nome, telefone, is_admin })

  if (!id) {
    alert('ID do usuário não encontrado.')
    return
  }

  const { error } = await supabase
    .from('usuarios')
    .update({ nome, telefone, is_admin })
    .eq('id', id)

  if (error) {
    alert('Erro ao atualizar usuário: ' + error.message)
  } else {
    alert('Usuário atualizado com sucesso!')
    fecharModal()
    carregarUsuarios()
  }
}

// Inicializa carregamento
carregarUsuarios()
