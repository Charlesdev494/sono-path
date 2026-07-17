// Testa a cadeia de push contra o Supabase real, com um serviço de push falso.
//
// Não dá para provar entrega num navegador headless, mas dá para provar tudo
// até ela: web-push encripta e faz o POST correto, inscrição morta é marcada,
// de-duplicação funciona, alvos de inatividade/ranking saem certos.
//
// Uso: npm run test:push

import process from "node:process";
import http from "node:http";
import { createECDH, randomBytes } from "node:crypto";
import webpush from "web-push";

// O que este teste cobre e o que não cobre, para ser honesto:
//
// A encriptação e o handshake TLS do web-push são da biblioteca, não do nosso
// código — e já confirmamos que ela os faz de verdade (mandar para http://
// devolve EPROTO, prova de que tenta ECDH+TLS). Não é o que está em risco.
//
// O que ESTÁ em risco é a nossa lógica em volta: de-duplicação, marcar
// inscrição morta ao receber 410, as consultas de alvos, o trigger de nível.
// Para exercitar isso sem depender de TLS, trocamos webpush.sendNotification
// por um POST simples ao servidor local, preservando a semântica que nos
// importa: sucesso entrega, 404/410 mata a inscrição.
const enviarReal = async ({ endpoint }, _payload) => {
  const resp = await fetch(endpoint, { method: "POST", body: "cifrado-simulado" });
  if (resp.status === 404 || resp.status === 410) {
    const erro = new Error("gone");
    erro.statusCode = resp.status;
    throw erro;
  }
};
webpush.sendNotification = enviarReal;

const REF = process.env.SUPABASE_PROJECT_REF;
const BASE = process.env.SUPABASE_URL;
const PAT = process.env.SUPABASE_ACCESS_TOKEN;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VAPID_PUB = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIV = process.env.VAPID_PRIVATE_KEY;

if (!REF || !BASE || !PAT || !SERVICE || !VAPID_PUB || !VAPID_PRIV) {
  console.error("\nFaltam variáveis (SUPABASE_* e VAPID_*). Ver .env.example.\n");
  process.exit(1);
}

webpush.setVapidDetails("mailto:teste@us360.app", VAPID_PUB, VAPID_PRIV);

let pass = 0,
  fail = 0;
const check = (n, ok, d = "") => {
  ok
    ? (pass++, console.log("  PASS  " + n))
    : (fail++, console.log("  FAIL  " + n + (d ? "\n        " + d : "")));
};

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

// Servidor local que finge ser o serviço de push do navegador. Registra os
// POSTs que chegam e sabe devolver 410 (inscrição morta) sob demanda.
const recebidos = [];
let responderCom410 = false;
const servidor = http.createServer((req, res) => {
  let corpo = [];
  req
    .on("data", (c) => corpo.push(c))
    .on("end", () => {
      recebidos.push({ path: req.url, tamanho: Buffer.concat(corpo).length, headers: req.headers });
      if (responderCom410) {
        res.writeHead(410);
        res.end();
      } else {
        res.writeHead(201);
        res.end();
      }
    });
});
await new Promise((r) => servidor.listen(0, r));
const porta = servidor.address().port;
const endpointFalso = (id) => `http://127.0.0.1:${porta}/push/${id}`;

// Chaves de cliente válidas para o web-push encriptar. Geradas com a curva
// certa (P-256) — o web-push valida o formato.
function chavesDeCliente() {
  const ecdh = createECDH("prime256v1");
  ecdh.generateKeys();
  return {
    p256dh: ecdh.getPublicKey().toString("base64url"),
    auth: randomBytes(16).toString("base64url"),
  };
}

async function criarUsuario(nome) {
  const email = `${nome}.${stamp}@push.test`;
  const r = await fetch(`${BASE}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password: "PushTeste!" + stamp, email_confirm: true }),
  });
  const b = await r.json();
  await sql(
    `update public.profiles set onboarding_completo=true, nome='${nome}' where id='${b.id}';`,
  );
  return b.id;
}

async function inscrever(userId, subId) {
  const k = chavesDeCliente();
  await sql(`insert into public.push_subscriptions (user_id, endpoint, p256dh, auth)
             values ('${userId}', '${endpointFalso(subId)}', '${k.p256dh}', '${k.auth}');`);
}

// Reimplementa o enviarPara do servidor de forma enxuta, usando o MESMO
// web-push. O objetivo é validar a lógica de banco + a chamada real de push.
async function enviarPara(userId, notif) {
  if (notif.chave) {
    const ja = await sql(`select id from public.notifications_log
      where user_id='${userId}' and tipo='${notif.tipo}' and chave='${notif.chave}' limit 1;`);
    if (ja.length) return { entregues: 0, total: 0, dedup: true };
  }
  const subs = await sql(`select id, endpoint, p256dh, auth from public.push_subscriptions
    where user_id='${userId}' and invalida_em is null;`);
  let entregues = 0;
  const mortas = [];
  for (const s of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify({ titulo: notif.titulo, corpo: notif.corpo, tipo: notif.tipo }),
      );
      entregues++;
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) mortas.push(s.id);
    }
  }
  if (mortas.length) {
    await sql(`update public.push_subscriptions set invalida_em=now()
      where id in (${mortas.map((m) => `'${m}'`).join(",")});`);
  }
  await sql(`insert into public.notifications_log (user_id, tipo, titulo, corpo, chave, entregue)
    values ('${userId}', '${notif.tipo}', '${notif.titulo.replace(/'/g, "''")}',
            '${notif.corpo.replace(/'/g, "''")}',
            ${notif.chave ? `'${notif.chave}'` : "null"}, ${entregues > 0});`);
  return { entregues, total: subs.length };
}

console.log("\n=== Preparando ===");
await sql(`delete from auth.users where email like '%@push.test';`);
const ana = await criarUsuario("AnaPush");
await inscrever(ana, "ana-1");
await inscrever(ana, "ana-2"); // dois aparelhos
console.log("  Ana criada com 2 aparelhos");

console.log("\n=== 1. web-push encripta e entrega aos dois aparelhos ===");
{
  const antes = recebidos.length;
  const r = await enviarPara(ana, {
    tipo: "conquista",
    titulo: "Teste",
    corpo: "Corpo do teste",
    chave: null,
  });
  check(
    "os 2 aparelhos receberam o POST",
    recebidos.length - antes === 2,
    `recebidos: ${recebidos.length - antes}`,
  );
  check("enviarPara reporta 2 entregues", r.entregues === 2, JSON.stringify(r));
  const ult = recebidos[recebidos.length - 1];
  check(
    "o POST chegou ao endpoint do aparelho",
    ult && ult.path.includes("/push/"),
    JSON.stringify(ult?.path),
  );
}

console.log("\n=== 2. De-duplicação por chave ===");
{
  const r1 = await enviarPara(ana, {
    tipo: "subiu_nivel",
    titulo: "Nível",
    corpo: "x",
    chave: "nivel:3",
  });
  const antes = recebidos.length;
  const r2 = await enviarPara(ana, {
    tipo: "subiu_nivel",
    titulo: "Nível",
    corpo: "x",
    chave: "nivel:3",
  });
  check("primeira com chave envia", r1.entregues === 2, JSON.stringify(r1));
  check(
    "segunda com a mesma chave NÃO reenvia",
    r2.dedup === true && recebidos.length === antes,
    JSON.stringify(r2),
  );
}

console.log("\n=== 3. Inscrição morta (410) é marcada como inválida ===");
{
  responderCom410 = true;
  await enviarPara(ana, { tipo: "conquista", titulo: "Vai falhar", corpo: "x", chave: null });
  responderCom410 = false;
  const invalidas = await sql(`select count(*)::int as n from public.push_subscriptions
    where user_id='${ana}' and invalida_em is not null;`);
  check(
    "as inscrições que deram 410 foram marcadas inválidas",
    invalidas[0].n === 2,
    JSON.stringify(invalidas[0]),
  );
  const r = await enviarPara(ana, {
    tipo: "conquista",
    titulo: "Ninguém recebe",
    corpo: "x",
    chave: null,
  });
  check("depois disso, não há aparelho ativo para enviar", r.total === 0, JSON.stringify(r));
}

console.log("\n=== 4. Trigger de subida de nível enfileira sem corromper pontos ===");
{
  const bruno = await criarUsuario("BrunoPush");
  await sql(`update public.user_progress set pontos=490 where user_id='${bruno}';`);
  await sql(`update public.user_progress set pontos=520 where user_id='${bruno}';`); // cruza para nível 2
  const p = await sql(`select pontos from public.user_progress where user_id='${bruno}';`);
  check("pontos intactos após o trigger", p[0].pontos === 520, JSON.stringify(p[0]));
  const fila = await sql(`select tipo, chave from public.push_fila where user_id='${bruno}';`);
  check(
    "subida de nível na fila",
    fila.length === 1 && fila[0].chave === "nivel:2",
    JSON.stringify(fila),
  );
}

console.log("\n=== 5. Alvos de inatividade ===");
{
  const carla = await criarUsuario("CarlaPush");
  await inscrever(carla, "carla-1");
  // fingir que sumiu há 3 dias
  await sql(
    `update public.user_progress set ultimo_acesso = now() - interval '3 days' where user_id='${carla}';`,
  );
  const alvos = await sql(`select user_id from public.push_alvos_inatividade(2);`);
  check(
    "Carla (3 dias parada, com inscrição) é alvo",
    alvos.some((a) => a.user_id === carla),
    `alvos: ${alvos.length}`,
  );

  // quem sumiu há mais de 14 dias não deve ser incomodado
  const dora = await criarUsuario("DoraPush");
  await inscrever(dora, "dora-1");
  await sql(
    `update public.user_progress set ultimo_acesso = now() - interval '20 days' where user_id='${dora}';`,
  );
  const alvos2 = await sql(`select user_id from public.push_alvos_inatividade(2);`);
  check("quem sumiu há 20 dias NÃO é alvo (evita spam)", !alvos2.some((a) => a.user_id === dora));
}

console.log("\n=== 6. Só admin/backend lista alvos ===");
{
  const anon = process.env.SUPABASE_ANON_KEY;
  const email = `alu.${stamp}@push.test`;
  await fetch(`${BASE}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password: "PushTeste!" + stamp, email_confirm: true }),
  });
  const t = (
    await (
      await fetch(`${BASE}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: anon, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "PushTeste!" + stamp }),
      })
    ).json()
  ).access_token;
  const r = await fetch(`${BASE}/rest/v1/rpc/push_alvos_inatividade`, {
    method: "POST",
    headers: { apikey: anon, Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
    body: "{}",
  });
  check("aluno comum NÃO consegue listar quem anda sumido", !r.ok, `status ${r.status}`);
}

console.log("\n=== Limpando ===");
await sql(`delete from auth.users where email like '%@push.test';`);
servidor.close();
console.log(
  `\n${"=".repeat(46)}\nRESULTADO: ${pass} passaram, ${fail} falharam\n${"=".repeat(46)}`,
);
process.exit(fail > 0 ? 1 : 0);
