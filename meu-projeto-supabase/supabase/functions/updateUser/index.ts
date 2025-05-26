import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("https://kiqvzarmwooveklezzfm.supabase.co")!;
const supabaseServiceRoleKey = Deno.env.get("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXZ6YXJtd29vdmVrbGV6emZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjA2MDQxMywiZXhwIjoyMDYxNjM2NDEzfQ.dgCI4FpEqGcAeWtgVvd80WjG6v9H26Wq0E8Gp3RKZ-c")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Método não permitido", { status: 405 });
    }

    const { id, is_admin } = await req.json();

    if (!id || typeof is_admin !== "boolean") {
      return new Response("Dados incompletos", { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("usuarios")
      .update({ is_admin })
      .eq("id", id);

    if (updateError) {
      return new Response("Erro ao atualizar usuário: " + updateError.message, { status: 500 });
    }

    return new Response(JSON.stringify({ message: "Usuário atualizado com sucesso" }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response("Erro interno do servidor: " + err.message, { status: 500 });
  }
});
