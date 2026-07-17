// Migra o conteúdo do código-fonte para o Supabase (Fase 1 do escopo v2).
//
// Faz duas coisas, nesta ordem:
//   1. Baixa as imagens do host de preview do Lovable e sobe para o nosso
//      Storage — hoje as imagens dependem de um host efêmero de terceiro.
//   2. Insere quiz, casos e atlas nas tabelas, reescrevendo as URLs das
//      imagens para as novas.
//
// É idempotente: roda quantas vezes quiser (upsert por slug). Usa service_role,
// então ignora RLS de propósito — é um script de backend, não roda no navegador.
//
// Uso:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... LOVABLE_PREVIEW_HOST=... \
//     node scripts/seed-content.mjs [--dry-run]

import process from "node:process";
import { loadContent } from "./lib/load-content.mjs";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PREVIEW_HOST = process.env.LOVABLE_PREVIEW_HOST;
const BUCKET = "content-images";
const DRY_RUN = process.argv.includes("--dry-run");

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Faltam SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no ambiente.");
  process.exit(1);
}
if (!PREVIEW_HOST && !DRY_RUN) {
  console.error("Falta LOVABLE_PREVIEW_HOST — é de onde as imagens são baixadas.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function rest(path, opts = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
}

async function upsert(table, rows, onConflict) {
  if (rows.length === 0) return [];
  const r = await rest(`${table}?on_conflict=${onConflict}`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(rows),
  });
  const body = await r.json();
  if (!r.ok) throw new Error(`upsert ${table}: ${JSON.stringify(body)}`);
  return body;
}

// O conteúdo antigo tem ids repetidos (duas questões distintas de gânglio
// estrelado nasceram como "estr1"). No app atual isso é um bug silencioso: o
// progresso é rastreado por id, então responder uma marcava a outra como
// respondida também. O banco não aceita slug duplicado, então desempatamos
// aqui — sempre na mesma ordem, para o slug não dançar entre execuções.
function slugsUnicos(itens, chave) {
  const vistos = new Map();
  const colisoes = [];
  const slugs = itens.map((item) => {
    const base = item[chave];
    const n = (vistos.get(base) ?? 0) + 1;
    vistos.set(base, n);
    if (n === 1) return base;
    const slug = `${base}-${n}`;
    colisoes.push({ base, slug });
    return slug;
  });
  return { slugs, colisoes };
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx], idx);
      }
    }),
  );
  return out;
}

// ---------------------------------------------------------------------------
// 1. imagens
// ---------------------------------------------------------------------------
// Varre o conteúdo atrás de toda string que seja uma URL de asset do Lovable.
function coletarUrls(node, encontradas = new Set()) {
  if (!node || typeof node !== "object") return encontradas;
  for (const value of Object.values(node)) {
    if (typeof value === "string" && value.startsWith("/__l5e/assets-v1/")) {
      encontradas.add(value);
    } else if (typeof value === "object") {
      coletarUrls(value, encontradas);
    }
  }
  return encontradas;
}

const MIME = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" };

async function migrarImagem(urlOriginal) {
  // /__l5e/assets-v1/<assetId>/<arquivo> → content/<assetId>/<arquivo>
  const partes = urlOriginal.replace("/__l5e/assets-v1/", "").split("/");
  const destino = `content/${partes.join("/")}`;
  const ext = destino.split(".").pop().toLowerCase();
  const contentType = MIME[ext] ?? "application/octet-stream";
  const urlPublica = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${destino}`;

  if (DRY_RUN) return { urlOriginal, urlPublica, status: "dry-run" };

  const origem = await fetch(`https://${PREVIEW_HOST}${urlOriginal}`);
  if (!origem.ok) {
    return { urlOriginal, urlPublica: null, status: `origem HTTP ${origem.status}` };
  }
  const bytes = Buffer.from(await origem.arrayBuffer());

  const up = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${destino}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: bytes,
  });
  if (!up.ok) {
    return {
      urlOriginal,
      urlPublica: null,
      status: `upload HTTP ${up.status}: ${await up.text()}`,
    };
  }
  return { urlOriginal, urlPublica, status: "ok", bytes: bytes.length };
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
console.log(`\nUS360 · seed de conteúdo${DRY_RUN ? " (dry-run)" : ""}`);
console.log("=".repeat(52));

const { QUIZ, CASOS, ATLAS } = await loadContent();
console.log(`Conteúdo lido do código:`);
console.log(`  ${QUIZ.length} questões de quiz`);
console.log(
  `  ${CASOS.length} casos clínicos (${CASOS.reduce((n, c) => n + c.questoes.length, 0)} questões)`,
);
console.log(
  `  ${ATLAS.length} regiões do atlas (${ATLAS.reduce((n, r) => n + r.estruturas.length, 0)} estruturas)`,
);

const urls = [...coletarUrls({ QUIZ, CASOS, ATLAS })];
console.log(`\nMigrando ${urls.length} imagens para o Storage...`);

const resultados = await mapLimit(urls, 6, migrarImagem);
const falhas = resultados.filter((r) => !r.urlPublica);
const ok = resultados.filter((r) => r.urlPublica);
const totalBytes = ok.reduce((n, r) => n + (r.bytes ?? 0), 0);
console.log(`  ${ok.length}/${urls.length} enviadas (${(totalBytes / 1024 / 1024).toFixed(1)} MB)`);

if (falhas.length) {
  console.error(`\n  ${falhas.length} imagens FALHARAM:`);
  falhas.slice(0, 10).forEach((f) => console.error(`    ${f.urlOriginal} → ${f.status}`));
  console.error(
    "\n  Abortado: subir conteúdo apontando para imagem quebrada é pior que não subir.",
  );
  process.exit(1);
}

// mapa url antiga → url nova
const mapa = new Map(resultados.map((r) => [r.urlOriginal, r.urlPublica]));
const novaUrl = (u) => (u ? (mapa.get(u) ?? u) : null);
// reescreve {url, legenda} preservando o resto
const reImg = (img) => (img ? { ...img, url: novaUrl(img.url) } : null);
const reImgs = (arr) => (Array.isArray(arr) ? arr.map(reImg).filter(Boolean) : []);

if (DRY_RUN) {
  console.log("\nDry-run: nada foi escrito no banco.");
  process.exit(0);
}

// --- quiz ---
console.log("\nInserindo quiz...");
const { slugs: quizSlugs, colisoes } = slugsUnicos(QUIZ, "id");
if (colisoes.length) {
  console.log(`  aviso: ${colisoes.length} id(s) repetido(s) no conteúdo de origem, renomeado(s):`);
  colisoes.forEach((c) => console.log(`    "${c.base}" (repetido) → "${c.slug}"`));
}
const quizRows = QUIZ.map((q, i) => ({
  slug: quizSlugs[i],
  regiao: q.regiao,
  nivel: q.nivel,
  enunciado: q.enunciado,
  caso: q.caso ?? null,
  imagem_label: q.imagemLabel ?? null,
  imagem_url: novaUrl(q.imagemUrl),
  alternativas: q.alternativas,
  correta: q.correta,
  explicacao: q.explicacao ?? "",
  status: "publicado",
  origem: "manual",
  ordem: i,
}));
const quizIn = await upsert("quiz_questions", quizRows, "slug");
console.log(`  ${quizIn.length} questões`);

// --- casos ---
console.log("Inserindo casos clínicos...");
const casoRows = CASOS.map((c) => ({
  slug: c.id,
  semana: c.semana ?? 0,
  titulo: c.titulo,
  regiao: c.regiao,
  imagem_label: c.imagemLabel ?? null,
  imagem_url: novaUrl(c.imagemUrl),
  apresentacao: c.apresentacao ?? "",
  exames_fisicos: c.examesFisicos ?? "",
  resolucao: c.resolucao ?? "",
  status: "publicado",
  origem: "manual",
}));
const casosIn = await upsert("clinical_cases", casoRows, "slug");
const idPorSlug = new Map(casosIn.map((c) => [c.slug, c.id]));
console.log(`  ${casosIn.length} casos`);

const questaoRows = CASOS.flatMap((c) =>
  c.questoes.map((q, i) => ({
    case_id: idPorSlug.get(c.id),
    slug: q.id,
    pergunta: q.pergunta,
    alternativas: q.alternativas,
    correta: q.correta,
    comentario: q.comentario ?? "",
    imagem_label: q.imagemLabel ?? null,
    imagem_url: novaUrl(q.imagemUrl),
    ordem: i,
  })),
);
const questoesIn = await upsert("case_questions", questaoRows, "case_id,slug");
console.log(`  ${questoesIn.length} questões de caso`);

// --- atlas ---
console.log("Inserindo atlas...");
const regiaoRows = ATLAS.map((r, i) => ({
  slug: r.slug,
  nome: r.nome,
  icone: r.icone ?? "",
  descricao: r.descricao ?? "",
  status: "publicado",
  ordem: i,
}));
const regioesIn = await upsert("atlas_regions", regiaoRows, "slug");
const regiaoIdPorSlug = new Map(regioesIn.map((r) => [r.slug, r.id]));
console.log(`  ${regioesIn.length} regiões`);

const estruturaRows = ATLAS.flatMap((r) =>
  r.estruturas.map((e, i) => ({
    region_id: regiaoIdPorSlug.get(r.slug),
    slug: e.slug,
    nome: e.nome,
    resumo: e.resumo ?? "",
    anatomia: e.anatomia ?? "",
    sonoanatomia: e.sonoanatomia ?? "",
    escaneamento: e.escaneamento ?? [],
    armadilhas: e.armadilhas ?? [],
    aplicacoes_clinicas: e.aplicacoesClinicas ?? [],
    volumes: e.volumes ?? [],
    imagens: reImgs(e.imagens),
    // o conteúdo antigo tem tanto armadilhaImagem (uma) quanto armadilhaImagens
    // (várias); o schema novo unifica numa lista só.
    armadilha_imagens: [
      ...(e.armadilhaImagem ? [reImg(e.armadilhaImagem)] : []),
      ...reImgs(e.armadilhaImagens),
    ],
    comparacoes: Array.isArray(e.comparacoes)
      ? e.comparacoes.map((c) => ({ ...c, raw: reImg(c.raw), anotada: reImg(c.anotada) }))
      : [],
    status: "publicado",
    origem: "manual",
    ordem: i,
  })),
);
const estruturasIn = await upsert("atlas_structures", estruturaRows, "region_id,slug");
console.log(`  ${estruturasIn.length} estruturas`);

console.log("\n" + "=".repeat(52));
console.log("Seed concluído.");
console.log(
  `  ${quizIn.length} quiz · ${casosIn.length} casos (${questoesIn.length} questões) · ${regioesIn.length} regiões (${estruturasIn.length} estruturas) · ${ok.length} imagens`,
);
