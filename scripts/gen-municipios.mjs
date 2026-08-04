// Gera src/content/municipios.ts a partir da API pública do IBGE.
//
// O arquivo é gerado e versionado, não consultado em tempo de execução: o app
// das lojas precisa funcionar sem rede, e o cadastro é a primeira tela que a
// pessoa vê — depender de uma API externa ali seria trocar um campo de texto
// que sempre funciona por um seletor que às vezes não abre.
//
// A lista de municípios muda raramente (criação ou fusão de cidade). Quando
// mudar, rode de novo: npm run municipios

import { writeFileSync } from "node:fs";
import process from "node:process";

const API = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios";

console.log("Buscando municípios no IBGE...");
const r = await fetch(API);
if (!r.ok) {
  console.error("Falha ao consultar o IBGE:", r.status);
  process.exit(1);
}
const municipios = await r.json();

// Ordena por nome já aqui, com o comparador do português (senão "Águas" cai
// depois de "Zacarias"). Fazer isso na geração evita reordenar 5 mil itens no
// celular a cada abertura do seletor.
const ptBR = new Intl.Collator("pt-BR");

const porUF = {};
const nomesUF = {};

for (const m of municipios) {
  const uf = m.microrregiao?.mesorregiao?.UF ?? m.regiao_imediata?.regiao_intermediaria?.UF;
  if (!uf) continue;
  (porUF[uf.sigla] ??= []).push(m.nome);
  nomesUF[uf.sigla] = uf.nome;
}

for (const sigla of Object.keys(porUF)) {
  porUF[sigla].sort(ptBR.compare);
}

const ufs = Object.keys(nomesUF)
  .map((sigla) => ({ sigla, nome: nomesUF[sigla] }))
  .sort((a, b) => ptBR.compare(a.nome, b.nome));

const total = Object.values(porUF).reduce((n, l) => n + l.length, 0);

const conteudo = `// GERADO por scripts/gen-municipios.mjs — não editar à mão.
// Fonte: IBGE (${API})
// ${ufs.length} unidades federativas, ${total} municípios, já em ordem alfabética pt-BR.

export type UF = { sigla: string; nome: string };

export const UFS: UF[] = ${JSON.stringify(ufs, null, 2)};

export const MUNICIPIOS: Record<string, string[]> = ${JSON.stringify(porUF)};
`;

const destino = "src/content/municipios.ts";
writeFileSync(destino, conteudo);
console.log(
  `${destino}: ${ufs.length} UFs, ${total} municípios (${(conteudo.length / 1024).toFixed(0)} KB)`,
);
