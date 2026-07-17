import process from "node:process";

import type { Database } from "../supabase/database.types";

// Configuração de push. .server.ts mantém a chave privada fora do bundle do
// navegador — como a IA, é lido dentro da função porque em runtime serverless
// o env só existe no momento da requisição.

export function getPushConfig() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:contato@us360.app";
  return {
    habilitado: Boolean(publicKey && privateKey),
    publicKey,
    privateKey,
    subject,
  };
}

/**
 * Cliente Supabase com service_role — ignora a RLS de propósito. Só o servidor
 * o usa, e só para o que o usuário não pode fazer sozinho: ler as inscrições
 * de todos os alvos e gravar no log de notificações.
 */
export async function getServiceClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes no servidor.");
  }
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
