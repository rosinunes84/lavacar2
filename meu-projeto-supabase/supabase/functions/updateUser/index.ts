import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('https://kiqvzarmwooveklezzfm.supabase.co') ?? '',
    Deno.env.get('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjA0MTMsImV4cCI6MjA2MTYzNjQxM30.aW2IAN1xlL8HOZfKqZnGr-7Lw5Ay-AA4MwT-E7dK1A8') ?? ''
  )

  const { nome } = await req.json()

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser(req.headers.get('Authorization')!.replace('Bearer ', ''))

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Usuário não autenticado' }), { status: 401 })
  }

  const { error: insertError } = await supabase
    .from('usuarios')
    .insert([{
      id: user.id,
      nome: nome || 'Usuário não informado',
      email: user.email,
      is_admin: false,
      role: 'user'
    }])

  if (insertError) {
    return new Response(JSON.stringify({ error: insertError.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ message: 'Perfil criado com sucesso' }), { status: 200 })
})
