// Promove (ou rebaixa) um usuário a administrador.
//
// Existe porque não há — de propósito — como virar admin pelo app: a RLS
// bloqueia, e o trigger guard_role_change reverte tentativas de auto-promoção.
// A porta de entrada é o backend, e é aqui.
//
// O usuário precisa já ter conta criada (ter entrado no app ao menos uma vez).
//
// Uso:
//   npm run make-admin -- charles@exemplo.com
//   npm run make-admin -- charles@exemplo.com --remover

import process from "node:process";

const REF = process.env.SUPABASE_PROJECT_REF;
const PAT = process.env.SUPABASE_ACCESS_TOKEN;

const args = process.argv.slice(2);
const email = args.find((a) => !a.startsWith("--"));
const remover = args.includes("--remover");

if (!REF || !PAT) {
  console.error("Faltam SUPABASE_PROJECT_REF e/ou SUPABASE_ACCESS_TOKEN (ver .env.example).");
  process.exit(1);
}
if (!email) {
  console.error("Informe o e-mail. Ex: npm run make-admin -- charles@exemplo.com");
  process.exit(1);
}

async function sql(query) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${PAT}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const body = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(body));
  return body;
}

// aspas simples escapadas para não abrir brecha de injeção via e-mail
const emailSeguro = email.replace(/'/g, "''");
const novoRole = remover ? "user" : "admin";

const usuario = await sql(
  `select u.id, u.email, p.role
   from auth.users u
   join public.profiles p on p.id = u.id
   where lower(u.email) = lower('${emailSeguro}');`,
);

if (usuario.length === 0) {
  console.error(`\nNenhuma conta encontrada para "${email}".`);
  console.error("A pessoa precisa criar a conta no app antes de ser promovida.\n");
  process.exit(1);
}

if (usuario[0].role === novoRole) {
  console.log(`\n${email} já é "${novoRole}". Nada a fazer.\n`);
  process.exit(0);
}

await sql(
  `update public.profiles set role = '${novoRole}'
   where id = '${usuario[0].id}';`,
);

const conferido = await sql(`select role from public.profiles where id = '${usuario[0].id}';`);

if (conferido[0]?.role !== novoRole) {
  console.error(`\nA alteração não pegou (role continua "${conferido[0]?.role}").`);
  process.exit(1);
}

console.log(`\n${email}: ${usuario[0].role} → ${conferido[0].role}`);
console.log(
  remover
    ? "Acesso de administrador removido.\n"
    : "Agora tem acesso de administrador ao conteúdo.\n",
);
