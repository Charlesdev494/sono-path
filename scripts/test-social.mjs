// Testa as regras sociais (Fase 3) contra o Supabase de verdade: ranking,
// amizades, conquistas e privacidade.
//
// Cria usuários descartáveis, exercita cada regra e limpa tudo no fim.
// Uso: npm run test:social

import process from "node:process";

const REF = process.env.SUPABASE_PROJECT_REF;
const BASE = process.env.SUPABASE_URL;
const PAT = process.env.SUPABASE_ACCESS_TOKEN;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = process.env.SUPABASE_ANON_KEY;

if (!REF || !BASE || !PAT || !SERVICE || !ANON) {
  console.error("\nFaltam variáveis de ambiente (ver .env.example).\n");
  process.exit(1);
}

let pass = 0,
  fail = 0;
function check(name, ok, detail = "") {
  if (ok) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name}${detail ? "\n        " + detail : ""}`);
  }
}

async function sql(query) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${PAT}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const b = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(b));
  return b;
}

const stamp = Date.now();
const PW = "SocialTeste!" + stamp;

async function criar(nome) {
  const email = `${nome}.${stamp}@social.test`;
  const r = await fetch(`${BASE}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password: PW,
      email_confirm: true,
      user_metadata: { full_name: nome },
    }),
  });
  const b = await r.json();
  if (!r.ok) throw new Error("criar: " + JSON.stringify(b));
  // o ranking só considera quem terminou o onboarding
  await sql(
    `update public.profiles set onboarding_completo = true, nome = '${nome}' where id = '${b.id}';`,
  );
  const t = await fetch(`${BASE}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PW }),
  });
  return { id: b.id, email, token: (await t.json()).access_token };
}

function rest(token, path, opts = {}) {
  return fetch(`${BASE}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
}

const rpc = async (token, fn, args = {}) => {
  const r = await rest(token, `rpc/${fn}`, { method: "POST", body: JSON.stringify(args) });
  return { ok: r.ok, status: r.status, data: await r.json() };
};

console.log("\n=== Preparando ===");
// Uma execução que quebrar no meio deixa Ana/Bruno/Carla para trás, e como os
// testes procuram por nome, a rodada seguinte encontra os usuários velhos e
// falha por motivo errado. Limpar antes evita perseguir bug que não existe.
await sql(`delete from auth.users where email like '%@social.test';`);

const ana = await criar("Ana");
const bruno = await criar("Bruno");
const carla = await criar("Carla");
console.log(`  Ana, Bruno e Carla criados`);

// Pontos controlados: Ana 300, Bruno 150, Carla 50 (direto no banco, para o
// ranking ter ordem previsível)
await sql(`update public.user_progress set pontos = 300 where user_id = '${ana.id}';`);
await sql(`update public.user_progress set pontos = 150 where user_id = '${bruno.id}';`);
await sql(`update public.user_progress set pontos = 50 where user_id = '${carla.id}';`);
await sql(`insert into public.points_events (user_id, pontos, motivo, created_at) values
  ('${ana.id}', 300, 'quiz', now() - interval '2 days'),
  ('${bruno.id}', 150, 'quiz', now() - interval '2 days'),
  ('${carla.id}', 50, 'quiz', now() - interval '40 days');`);

console.log("\n=== 1. Ranking geral ===");
{
  const { data } = await rpc(ana.token, "ranking", { p_periodo: "sempre", p_escopo: "todos" });
  const nossos = data.filter((r) => ["Ana", "Bruno", "Carla"].includes(r.nome));
  check(
    "ordena por pontos (Ana > Bruno > Carla)",
    nossos[0]?.nome === "Ana" && nossos[1]?.nome === "Bruno" && nossos[2]?.nome === "Carla",
    JSON.stringify(nossos.map((r) => `${r.nome}:${r.pontos}`)),
  );
  check("marca quem é você", data.find((r) => r.nome === "Ana")?.e_voce === true);
  check("não marca os outros como você", data.find((r) => r.nome === "Bruno")?.e_voce === false);
}

console.log("\n=== 2. Ranking por período ===");
{
  // Carla pontuou há 40 dias: fora da semana e do mês
  const semana = await rpc(ana.token, "ranking", { p_periodo: "semana", p_escopo: "todos" });
  const carlaSemana = semana.data.find((r) => r.nome === "Carla");
  check(
    "no ranking da semana, quem não pontuou fica com 0",
    Number(carlaSemana?.pontos) === 0,
    JSON.stringify(carlaSemana),
  );
  const anaSemana = semana.data.find((r) => r.nome === "Ana");
  check(
    "quem pontuou na semana aparece com os pontos do período",
    Number(anaSemana?.pontos) === 300,
    JSON.stringify(anaSemana),
  );

  const mes = await rpc(ana.token, "ranking", { p_periodo: "mes", p_escopo: "todos" });
  check(
    "ranking do mês também funciona",
    Number(mes.data.find((r) => r.nome === "Ana")?.pontos) === 300,
  );
}

console.log("\n=== 3. Bônus de caso e atlas contam no ranking do período ===");
{
  // Este é o motivo de points_events existir: sem ele, estes pontos sumiriam
  // do ranking semanal e o total não bateria.
  await sql(`insert into public.points_events (user_id, pontos, motivo) values
    ('${bruno.id}', 30, 'caso_bonus'), ('${bruno.id}', 5, 'atlas');`);
  const { data } = await rpc(ana.token, "ranking", { p_periodo: "semana", p_escopo: "todos" });
  const b = data.find((r) => r.nome === "Bruno");
  check(
    "bônus de caso e atlas entram no ranking da semana",
    Number(b?.pontos) === 185,
    `esperado 185 (150+30+5), veio ${b?.pontos}`,
  );
}

console.log("\n=== 4. Amizades ===");
{
  const env = await rest(ana.token, "friendships", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ solicitante_id: ana.id, destinatario_id: bruno.id }),
  });
  check("Ana envia convite para Bruno", env.ok, `status ${env.status}`);
  const amizade = (await env.json())[0];

  // furo clássico: quem envia aceitar o próprio convite
  const auto = await rest(ana.token, `friendships?id=eq.${amizade?.id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "aceito" }),
  });
  const dep = await sql(`select status from public.friendships where id = '${amizade?.id}';`);
  check(
    "quem ENVIOU não consegue aceitar o próprio convite",
    dep[0]?.status === "pendente",
    `PATCH status ${auto.status}; status agora: ${dep[0]?.status}`,
  );

  const ac = await rest(bruno.token, `friendships?id=eq.${amizade?.id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "aceito" }),
  });
  const dep2 = await sql(`select status from public.friendships where id = '${amizade?.id}';`);
  check("o DESTINATÁRIO aceita", dep2[0]?.status === "aceito", `PATCH status ${ac.status}`);

  const terceiro = await rest(carla.token, `friendships?select=id`, {});
  const vistas = await terceiro.json();
  check("Carla não enxerga a amizade dos outros", vistas.length === 0, JSON.stringify(vistas));

  const forjar = await rest(carla.token, "friendships", {
    method: "POST",
    body: JSON.stringify({ solicitante_id: ana.id, destinatario_id: carla.id }),
  });
  check("ninguém cria convite em nome de outro", !forjar.ok, `status ${forjar.status}`);
}

console.log("\n=== 5. Ranking entre amigos ===");
{
  const { data } = await rpc(ana.token, "ranking", { p_periodo: "sempre", p_escopo: "amigos" });
  const nomes = data.map((r) => r.nome).sort();
  check(
    "mostra só você e seus amigos",
    JSON.stringify(nomes) === JSON.stringify(["Ana", "Bruno"]),
    JSON.stringify(nomes),
  );
  check("Carla (não amiga) fica de fora", !data.some((r) => r.nome === "Carla"));
}

console.log("\n=== 6. Liga por nível ===");
{
  // Ana 300 e Bruno 185 estão no nível 1; vamos subir Carla para o nível 2
  await sql(`update public.user_progress set pontos = 900 where user_id = '${carla.id}';`);
  const { data } = await rpc(ana.token, "ranking", { p_periodo: "sempre", p_escopo: "liga" });
  check(
    "liga mostra só quem está no mesmo nível",
    data.some((r) => r.nome === "Ana") && !data.some((r) => r.nome === "Carla"),
    JSON.stringify(data.map((r) => `${r.nome}:n${r.nivel}`)),
  );
}

console.log("\n=== 7. Minha posição ===");
{
  const { data } = await rpc(bruno.token, "minha_posicao", {
    p_periodo: "sempre",
    p_escopo: "todos",
  });
  check(
    "devolve posição e total de participantes",
    data[0]?.posicao > 0 && data[0]?.total_participantes >= 3,
    JSON.stringify(data[0]),
  );
}

console.log("\n=== 8. Privacidade ===");
{
  await sql(`update public.profiles set aparece_no_ranking = false where id = '${carla.id}';`);
  const outros = await rpc(ana.token, "ranking", { p_periodo: "sempre", p_escopo: "todos" });
  check(
    "quem optou por sair some do ranking dos outros",
    !outros.data.some((r) => r.nome === "Carla"),
  );

  const dela = await rpc(carla.token, "ranking", { p_periodo: "sempre", p_escopo: "todos" });
  check(
    "mas continua vendo a si mesma",
    dela.data.some((r) => r.nome === "Carla" && r.e_voce),
  );

  const busca = await rpc(ana.token, "buscar_usuarios", { p_termo: "Carla" });
  check("e não é encontrada na busca", busca.data.length === 0, JSON.stringify(busca.data));
  await sql(`update public.profiles set aparece_no_ranking = true where id = '${carla.id}';`);
}

console.log("\n=== 9. Busca de colegas ===");
{
  const curto = await rpc(ana.token, "buscar_usuarios", { p_termo: "Br" });
  check("busca com menos de 3 letras não lista a base inteira", curto.data.length === 0);

  const ok = await rpc(ana.token, "buscar_usuarios", { p_termo: "Bruno" });
  check(
    "encontra pelo nome",
    ok.data.some((u) => u.nome === "Bruno"),
    JSON.stringify(ok.data),
  );
  check(
    "mostra a situação da amizade",
    ok.data.find((u) => u.nome === "Bruno")?.situacao === "amigo",
    JSON.stringify(ok.data.find((u) => u.nome === "Bruno")),
  );

  const campos = Object.keys(ok.data[0] ?? {});
  check(
    "busca não vaza dados pessoais (cidade, especialidade, e-mail)",
    !campos.some((c) => ["cidade", "especialidade", "email", "tempo_formado"].includes(c)),
    JSON.stringify(campos),
  );

  const eu = await rpc(ana.token, "buscar_usuarios", { p_termo: "Ana" });
  check("não retorna você mesmo na busca", !eu.data.some((u) => u.user_id === ana.id));
}

console.log("\n=== 10. Conquistas ===");
{
  await sql(`update public.user_progress set streak = 7 where user_id = '${ana.id}';`);
  const c1 = await rpc(ana.token, "verificar_conquistas");
  check(
    "conquista de 7 dias é concedida",
    c1.data.some((b) => b.slug === "streak-7"),
    JSON.stringify(c1.data.map((b) => b.slug)),
  );

  const c2 = await rpc(ana.token, "verificar_conquistas");
  check(
    "não concede a mesma conquista duas vezes",
    !c2.data.some((b) => b.slug === "streak-7"),
    JSON.stringify(c2.data.map((b) => b.slug)),
  );

  await sql(`update public.user_progress set pontos = 1600 where user_id = '${ana.id}';`);
  const c3 = await rpc(ana.token, "verificar_conquistas");
  check(
    "conquista de nível 3 ao atingir 1500 pts",
    c3.data.some((b) => b.slug === "nivel-3"),
    JSON.stringify(c3.data.map((b) => b.slug)),
  );

  const lista = await rpc(ana.token, "conquistas_de", { p_user_id: ana.id });
  check(
    "lista as conquistas do usuário",
    lista.data.length >= 2,
    JSON.stringify(lista.data.map((b) => b.slug)),
  );

  const doAmigo = await rpc(bruno.token, "conquistas_de", { p_user_id: ana.id });
  check("dá para ver as conquistas de um colega", doAmigo.data.length >= 2);

  const semNada = await rpc(carla.token, "verificar_conquistas");
  check(
    "quem não fez nada não ganha medalha",
    semNada.data.length === 0,
    JSON.stringify(semNada.data.map((b) => b.slug)),
  );
}

console.log("\n=== 11. Pontos não são graváveis pelo cliente ===");
{
  const r = await rest(ana.token, "points_events", {
    method: "POST",
    body: JSON.stringify({ user_id: ana.id, pontos: 99999, motivo: "quiz" }),
  });
  check("aluno não consegue inserir eventos de pontos", !r.ok, `status ${r.status}`);

  const r2 = await rest(ana.token, "user_badges", {
    method: "POST",
    body: JSON.stringify({ user_id: ana.id, badge_slug: "quiz-100" }),
  });
  check("aluno não consegue se dar uma medalha", !r2.ok, `status ${r2.status}`);
}

console.log("\n=== Limpando ===");
await sql(`delete from auth.users where email like '%.${stamp}@social.test';`);
const restam = await sql(`select count(*)::int as n from public.friendships;`);
console.log(`  amizades restantes: ${restam[0].n}`);

console.log(`\n${"=".repeat(48)}`);
console.log(`RESULTADO: ${pass} passaram, ${fail} falharam`);
console.log("=".repeat(48));
process.exit(fail > 0 ? 1 : 0);
