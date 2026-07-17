// Testa as garantias de segurança do schema (RLS) contra o Supabase de verdade.
//
// Cria usuários descartáveis, tenta furar cada regra e limpa tudo no fim.
// Roda contra um projeto de teste ou o de desenvolvimento — nunca produção com
// dados reais, pois cria e apaga usuários.
//
// Uso: veja as variáveis de ambiente exigidas abaixo.

import process from "node:process";

const REF = process.env.SUPABASE_PROJECT_REF;
const BASE = process.env.SUPABASE_URL;
const PAT = process.env.SUPABASE_ACCESS_TOKEN;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = process.env.SUPABASE_ANON_KEY;

if (!REF || !BASE || !PAT || !SERVICE || !ANON) {
  console.error(
    [
      "",
      "Faltam variáveis de ambiente. Necessárias:",
      "  SUPABASE_PROJECT_REF        ref do projeto (ex: jkaemncenclicglbjoue)",
      "  SUPABASE_URL                https://<ref>.supabase.co",
      "  SUPABASE_ACCESS_TOKEN       personal access token (sbp_...)",
      "  SUPABASE_SERVICE_ROLE_KEY   service_role key",
      "  SUPABASE_ANON_KEY           anon key",
      "",
    ].join("\n"),
  );
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
  const body = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(body));
  return body;
}

async function createUser(email, password) {
  const r = await fetch(`${BASE}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Teste " + email.split("@")[0] },
    }),
  });
  const body = await r.json();
  if (!r.ok) throw new Error("createUser: " + JSON.stringify(body));
  return body.id;
}

async function signIn(email, password) {
  const r = await fetch(`${BASE}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await r.json();
  if (!r.ok) throw new Error("signIn: " + JSON.stringify(body));
  return body.access_token;
}

// chamada REST como um usuário logado comum
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

const stamp = Date.now();
const ADMIN_EMAIL = `admin.teste.${stamp}@us360.test`;
const USER_EMAIL = `aluno.teste.${stamp}@us360.test`;
const PW = "SenhaDeTeste!" + stamp;

console.log("\n=== Preparando usuários de teste ===");
const adminId = await createUser(ADMIN_EMAIL, PW);
const userId = await createUser(USER_EMAIL, PW);
console.log(`  admin: ${adminId}`);
console.log(`  aluno: ${userId}`);

// promove um deles a admin (como o Charles seria promovido, direto no banco)
await sql(`update public.profiles set role = 'admin' where id = '${adminId}';`);
{
  // O guard de role já reverteu esta promoção em silêncio uma vez. Se o setup
  // falhar de novo, o teste inteiro vira falso-positivo — então falha aqui.
  const r = await sql(`select role from public.profiles where id = '${adminId}';`);
  if (r[0]?.role !== "admin") {
    console.error(`\n  ABORTADO: promoção a admin não pegou (role = ${r[0]?.role}).`);
    console.error("  O backend precisa conseguir criar o primeiro admin.\n");
    process.exit(1);
  }
  console.log("  promoção a admin: OK");
}

const adminToken = await signIn(ADMIN_EMAIL, PW);
const userToken = await signIn(USER_EMAIL, PW);

console.log("\n=== 1. Trigger de cadastro (perfil + progresso automáticos) ===");
{
  const p = await sql(`select id, nome, role from public.profiles where id = '${userId}';`);
  check("perfil criado automaticamente no signup", p.length === 1, JSON.stringify(p));
  check("nome veio do metadata do provedor", p[0]?.nome?.startsWith("Teste"), JSON.stringify(p[0]));
  check("role padrão é 'user'", p[0]?.role === "user", JSON.stringify(p[0]));
  const up = await sql(
    `select user_id, pontos, streak from public.user_progress where user_id = '${userId}';`,
  );
  check(
    "progresso criado automaticamente (zerado)",
    up.length === 1 && up[0].pontos === 0,
    JSON.stringify(up),
  );
}

console.log("\n=== 2. Conteúdo de teste (criado pelo admin, via REST) ===");
let quizId = null;
{
  const r = await rest(adminToken, "quiz_questions", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      slug: "teste-rls-" + stamp,
      regiao: "Ombro",
      nivel: "basico",
      enunciado: "Questão de teste RLS",
      alternativas: [
        { letra: "A", texto: "Alternativa A" },
        { letra: "B", texto: "Alternativa B" },
      ],
      correta: "B",
      explicacao: "B é a correta.",
      status: "publicado",
    }),
  });
  const body = await r.json();
  check("admin CONSEGUE criar questão", r.ok, r.ok ? "" : JSON.stringify(body));
  quizId = body?.[0]?.id;
}

console.log("\n=== 3. Aluno comum NÃO pode editar conteúdo (a regra do Charles) ===");
{
  const r = await rest(userToken, "quiz_questions", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      slug: "hack-" + stamp,
      regiao: "X",
      enunciado: "invasão",
      alternativas: [
        { letra: "A", texto: "a" },
        { letra: "B", texto: "b" },
      ],
      correta: "A",
      status: "publicado",
    }),
  });
  check(
    "aluno NÃO consegue criar questão",
    r.status === 401 || r.status === 403,
    `status ${r.status}`,
  );

  const r2 = await rest(userToken, `quiz_questions?id=eq.${quizId}`, {
    method: "PATCH",
    body: JSON.stringify({ enunciado: "ENUNCIADO ADULTERADO" }),
  });
  const after = await sql(`select enunciado from public.quiz_questions where id = '${quizId}';`);
  check(
    "aluno NÃO consegue editar questão existente",
    after[0]?.enunciado === "Questão de teste RLS",
    `PATCH status ${r2.status}; enunciado agora: ${after[0]?.enunciado}`,
  );

  const r3 = await rest(userToken, `quiz_questions?id=eq.${quizId}`, { method: "DELETE" });
  const still = await sql(
    `select count(*)::int as n from public.quiz_questions where id = '${quizId}';`,
  );
  check("aluno NÃO consegue apagar questão", still[0]?.n === 1, `DELETE status ${r3.status}`);
}

console.log("\n=== 4. Escalação de privilégio (o furo clássico) ===");
{
  const r = await rest(userToken, `profiles?id=eq.${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ role: "admin" }),
  });
  const after = await sql(`select role from public.profiles where id = '${userId}';`);
  check(
    "aluno NÃO consegue se promover a admin",
    after[0]?.role === "user",
    `PATCH status ${r.status}; role agora: ${after[0]?.role}`,
  );

  // e o perfil de outra pessoa?
  const r2 = await rest(userToken, `profiles?id=eq.${adminId}`, {
    method: "PATCH",
    body: JSON.stringify({ nome: "invadido" }),
  });
  const other = await sql(`select nome from public.profiles where id = '${adminId}';`);
  check(
    "aluno NÃO consegue editar perfil alheio",
    other[0]?.nome !== "invadido",
    `PATCH status ${r2.status}; nome: ${other[0]?.nome}`,
  );
}

console.log("\n=== 5. Rascunho não vaza para o aluno ===");
{
  await sql(`insert into public.quiz_questions (slug, regiao, enunciado, alternativas, correta, status)
             values ('rascunho-${stamp}', 'Punho', 'Rascunho secreto',
                     '[{"letra":"A","texto":"a"},{"letra":"B","texto":"b"}]'::jsonb, 'A', 'rascunho');`);
  const r = await rest(userToken, `quiz_questions?slug=eq.rascunho-${stamp}`);
  const rows = await r.json();
  check(
    "aluno NÃO enxerga questão em rascunho",
    Array.isArray(rows) && rows.length === 0,
    JSON.stringify(rows),
  );

  const r2 = await rest(adminToken, `quiz_questions?slug=eq.rascunho-${stamp}`);
  const rows2 = await r2.json();
  check(
    "admin ENXERGA questão em rascunho",
    Array.isArray(rows2) && rows2.length === 1,
    JSON.stringify(rows2),
  );
}

console.log("\n=== 6. Pontuação validada no servidor ===");
{
  // não pode escrever pontos direto
  const r = await rest(userToken, `user_progress?user_id=eq.${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ pontos: 999999 }),
  });
  const after = await sql(`select pontos from public.user_progress where user_id = '${userId}';`);
  check(
    "aluno NÃO consegue escrever pontos direto",
    after[0]?.pontos === 0,
    `PATCH status ${r.status}; pontos: ${after[0]?.pontos}`,
  );

  // resposta errada: o servidor decide que errou (a questão é de nível básico,
  // então rende 5 pontos de consolação — regra do app, coberta em detalhe em 6b)
  const rw = await rest(userToken, "rpc/registrar_resposta", {
    method: "POST",
    body: JSON.stringify({ p_origem: "quiz", p_questao_id: quizId, p_resposta: "A" }),
  });
  const wrong = await rw.json();
  check(
    "servidor marca resposta errada como errada",
    rw.ok && wrong?.[0]?.acertou === false && wrong?.[0]?.pontos_ganhos === 5,
    JSON.stringify(wrong),
  );

  // resposta certa (de outro usuário, pois o primeiro já respondeu)
  const email3 = `aluno2.${stamp}@us360.test`;
  await createUser(email3, PW);
  const t3 = await signIn(email3, PW);
  const rr = await rest(t3, "rpc/registrar_resposta", {
    method: "POST",
    body: JSON.stringify({ p_origem: "quiz", p_questao_id: quizId, p_resposta: "B" }),
  });
  const right = await rr.json();
  check(
    "resposta certa é creditada pelo servidor (básico = 20 pts)",
    rr.ok &&
      right?.[0]?.acertou === true &&
      right?.[0]?.pontos_ganhos === 20 &&
      right?.[0]?.pontos_total === 20,
    JSON.stringify(right),
  );

  // repetir a mesma questão não pontua de novo
  const rr2 = await rest(t3, "rpc/registrar_resposta", {
    method: "POST",
    body: JSON.stringify({ p_origem: "quiz", p_questao_id: quizId, p_resposta: "B" }),
  });
  const again = await rr2.json();
  check(
    "responder a mesma questão de novo não pontua",
    rr2.ok && again?.[0]?.pontos_ganhos === 0 && again?.[0]?.pontos_total === 20,
    JSON.stringify(again),
  );
}

console.log("\n=== 6b. Pontuação fiel às regras do app ===");
{
  // básico: acerto 20 / erro 5 · avançado: acerto 30 / erro 10
  const casos = [
    { nivel: "basico", resposta: "B", esperado: 20, desc: "quiz básico correto = 20 pts" },
    {
      nivel: "basico",
      resposta: "A",
      esperado: 5,
      desc: "quiz básico errado = 5 pts (consolação)",
    },
    { nivel: "avancado", resposta: "B", esperado: 30, desc: "quiz avançado correto = 30 pts" },
    {
      nivel: "avancado",
      resposta: "A",
      esperado: 10,
      desc: "quiz avançado errado = 10 pts (consolação)",
    },
  ];

  for (const [i, c] of casos.entries()) {
    const slug = `pts-${c.nivel}-${i}-${stamp}`;
    const q =
      await sql(`insert into public.quiz_questions (slug, regiao, nivel, enunciado, alternativas, correta, status)
      values ('${slug}', 'Teste', '${c.nivel}', 'pontuação',
              '[{"letra":"A","texto":"a"},{"letra":"B","texto":"b"}]'::jsonb, 'B', 'publicado')
      returning id;`);
    const email = `pts${i}.${stamp}@us360.test`;
    await createUser(email, PW);
    const t = await signIn(email, PW);
    const r = await rest(t, "rpc/registrar_resposta", {
      method: "POST",
      body: JSON.stringify({ p_origem: "quiz", p_questao_id: q[0].id, p_resposta: c.resposta }),
    });
    const res = await r.json();
    check(
      c.desc,
      r.ok && res?.[0]?.pontos_ganhos === c.esperado,
      `esperado ${c.esperado}, veio ${JSON.stringify(res)}`,
    );
  }

  // atlas: 5 pts na primeira visita, 0 nas seguintes
  const emailA = `atlas.${stamp}@us360.test`;
  await createUser(emailA, PW);
  const tA = await signIn(emailA, PW);
  const v1 = await (
    await rest(tA, "rpc/registrar_visita_atlas", {
      method: "POST",
      body: JSON.stringify({ p_slug: "ombro/supraespinhal" }),
    })
  ).json();
  check("atlas: estrutura nova = 5 pts", v1?.[0]?.pontos_ganhos === 5, JSON.stringify(v1));
  const v2 = await (
    await rest(tA, "rpc/registrar_visita_atlas", {
      method: "POST",
      body: JSON.stringify({ p_slug: "ombro/supraespinhal" }),
    })
  ).json();
  check("atlas: revisitar não pontua de novo", v2?.[0]?.pontos_ganhos === 0, JSON.stringify(v2));

  // caso: 15 por questão certa + 30 de bônus ao concluir
  const caso = await sql(`insert into public.clinical_cases (slug, titulo, regiao, status)
    values ('caso-pts-${stamp}', 'Caso teste', 'Teste', 'publicado') returning id;`);
  const cq =
    await sql(`insert into public.case_questions (case_id, slug, pergunta, alternativas, correta)
    values ('${caso[0].id}', 'cq1', 'p', '[{"letra":"A","texto":"a"},{"letra":"B","texto":"b"}]'::jsonb, 'B')
    returning id;`);
  const emailC = `caso.${stamp}@us360.test`;
  await createUser(emailC, PW);
  const tC = await signIn(emailC, PW);
  const rq = await (
    await rest(tC, "rpc/registrar_resposta", {
      method: "POST",
      body: JSON.stringify({ p_origem: "caso", p_questao_id: cq[0].id, p_resposta: "B" }),
    })
  ).json();
  check("caso: questão certa = 15 pts", rq?.[0]?.pontos_ganhos === 15, JSON.stringify(rq));

  const b1 = await (
    await rest(tC, "rpc/concluir_caso", {
      method: "POST",
      body: JSON.stringify({ p_caso_id: caso[0].id }),
    })
  ).json();
  check("caso: bônus de conclusão = 30 pts", b1 === 30, JSON.stringify(b1));

  const b2 = await (
    await rest(tC, "rpc/concluir_caso", {
      method: "POST",
      body: JSON.stringify({ p_caso_id: caso[0].id }),
    })
  ).json();
  check("caso: bônus não paga duas vezes", b2 === 0, JSON.stringify(b2));

  const totalC = await sql(`select up.pontos from public.user_progress up
    join auth.users u on u.id = up.user_id where u.email = '${emailC}';`);
  check("caso: total confere (15 + 30 = 45)", totalC[0]?.pontos === 45, JSON.stringify(totalC));
}

console.log("\n=== 7. Streak no servidor ===");
{
  const r = await rest(userToken, "rpc/touch_streak", { method: "POST" });
  const s = await r.json();
  check("touch_streak inicia streak em 1", r.ok && s?.[0]?.streak === 1, JSON.stringify(s));

  const r2 = await rest(userToken, "rpc/touch_streak", { method: "POST" });
  const s2 = await r2.json();
  check(
    "touch_streak no mesmo dia mantém streak em 1",
    r2.ok && s2?.[0]?.streak === 1,
    JSON.stringify(s2),
  );

  // simula acesso de ontem → deve virar 2
  await sql(
    `update public.user_progress set ultimo_acesso = now() - interval '1 day' where user_id = '${userId}';`,
  );
  const r3 = await rest(userToken, "rpc/touch_streak", { method: "POST" });
  const s3 = await r3.json();
  check(
    "acesso no dia seguinte incrementa streak para 2",
    r3.ok && s3?.[0]?.streak === 2,
    JSON.stringify(s3),
  );

  // simula sumiço de 5 dias → volta pra 1
  await sql(
    `update public.user_progress set ultimo_acesso = now() - interval '5 days' where user_id = '${userId}';`,
  );
  const r4 = await rest(userToken, "rpc/touch_streak", { method: "POST" });
  const s4 = await r4.json();
  check(
    "faltar dias zera o streak de volta para 1",
    r4.ok && s4?.[0]?.streak === 1,
    JSON.stringify(s4),
  );
}

console.log("\n=== 8. Estatísticas do admin ===");
{
  const r = await rest(userToken, "rpc/admin_stats_overview", { method: "POST" });
  check("aluno NÃO acessa estatísticas", !r.ok, `status ${r.status}`);

  const r2 = await rest(adminToken, "rpc/admin_stats_overview", { method: "POST" });
  const stats = await r2.json();
  check(
    "admin acessa estatísticas",
    r2.ok && stats?.[0]?.usuarios_total >= 3,
    JSON.stringify(stats),
  );
}

console.log("\n=== 9. Integridade das alternativas ===");
{
  try {
    await sql(`insert into public.quiz_questions (slug, regiao, enunciado, alternativas, correta, status)
               values ('gabarito-torto-${stamp}', 'Joelho', 'gabarito aponta pra alternativa inexistente',
                       '[{"letra":"A","texto":"a"},{"letra":"B","texto":"b"}]'::jsonb, 'D', 'rascunho');`);
    check("banco rejeita gabarito apontando alternativa inexistente", false, "o insert passou!");
  } catch {
    check("banco rejeita gabarito apontando alternativa inexistente", true);
  }
}

console.log("\n=== 10. Exclusão de conta (exigência das lojas) ===");
{
  const r = await rest(userToken, "rpc/delete_own_account", { method: "POST" });
  const gone = await sql(`select count(*)::int as n from auth.users where id = '${userId}';`);
  const profGone = await sql(
    `select count(*)::int as n from public.profiles where id = '${userId}';`,
  );
  check("usuário exclui a própria conta", r.ok && gone[0]?.n === 0, `status ${r.status}`);
  check("perfil some junto (cascade)", profGone[0]?.n === 0, JSON.stringify(profGone));
}

// limpeza
console.log("\n=== Limpando dados de teste ===");
await sql(`delete from public.clinical_cases where slug like '%${stamp}%';`);
await sql(`delete from public.quiz_questions where slug like '%${stamp}%';`);
await sql(`delete from auth.users where email like '%${stamp}@us360.test';`);
const left = await sql(`select count(*)::int as n from public.profiles;`);
console.log(`  perfis restantes no banco: ${left[0].n}`);

console.log(`\n${"=".repeat(50)}`);
console.log(`RESULTADO: ${pass} passaram, ${fail} falharam`);
console.log("=".repeat(50));
process.exit(fail > 0 ? 1 : 0);
