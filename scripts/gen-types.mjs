// Regera src/lib/supabase/database.types.ts a partir do schema real do banco.
// Rode sempre que a migration mudar — é o que impede o app e o banco de
// divergirem em silêncio.
//
// Uso: npm run types:gen   (precisa de SUPABASE_ACCESS_TOKEN e SUPABASE_PROJECT_REF)

import process from "node:process";
import { writeFileSync } from "node:fs";

const REF = process.env.SUPABASE_PROJECT_REF;
const PAT = process.env.SUPABASE_ACCESS_TOKEN;

if (!REF || !PAT) {
  console.error("Faltam SUPABASE_PROJECT_REF e/ou SUPABASE_ACCESS_TOKEN (ver .env.example).");
  process.exit(1);
}

const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/types/typescript`, {
  headers: { Authorization: `Bearer ${PAT}` },
});
const body = await r.json();
if (!r.ok || !body.types) {
  console.error("Falha ao gerar tipos:", JSON.stringify(body).slice(0, 300));
  process.exit(1);
}

const destino = "src/lib/supabase/database.types.ts";
writeFileSync(
  destino,
  "// Gerado a partir do schema do Supabase. NÃO editar à mão.\n// Regerar:  npm run types:gen\n\n" +
    body.types,
);
console.log(`${destino} atualizado (${body.types.length} chars)`);
