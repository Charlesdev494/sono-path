// Gera o "Secret Key (for OAuth)" que o Supabase pede para o Sign in with Apple.
//
// Esse campo não recebe a chave da Apple: recebe um JWT assinado COM ela. A
// Apple limita a validade a 6 meses — não existe token perpétuo. O arquivo .p8
// não expira, então daqui a 6 meses basta rodar este script de novo.
//
// O .p8 nunca entra no repositório: é passado por caminho. E o token sai em
// arquivo, não na tela, para não vazar em log ou histórico de terminal.
//
// Uso:
//   node scripts/gen-apple-secret.mjs --p8 "C:/.../AuthKey_XXXX.p8" --kid XXXX
//
// Opcionais: --team, --client (Services ID), --out

import { createSign, createPrivateKey, sign as assinar } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import process from "node:process";

function arg(nome, padrao) {
  const i = process.argv.indexOf(`--${nome}`);
  const v = i >= 0 ? process.argv[i + 1] : undefined;
  if (!v && padrao === undefined) {
    console.error(`Faltou --${nome}`);
    process.exit(1);
  }
  return v ?? padrao;
}

const P8 = arg("p8");
const KEY_ID = arg("kid");
const TEAM_ID = arg("team", "75W4LAAFHK");
// O 'sub' é o client_id do fluxo OAuth — o Services ID, não o bundle do app.
// Não pode começar com o App ID (com.drcharles.sonopath): a Apple reserva
// esse prefixo e recusa o registro com "identifier is not available".
const CLIENT_ID = arg("client", "com.drcharles.us360.web");
const SAIDA = arg("out", "apple-client-secret.txt");

const b64url = (buf) =>
  Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const agora = Math.floor(Date.now() / 1000);
// 15777000s = 6 meses, o teto da Apple. Usar menos só encurta a manutenção à toa.
const MAX = 15777000;

const header = { alg: "ES256", kid: KEY_ID };
const payload = {
  iss: TEAM_ID,
  iat: agora,
  exp: agora + MAX,
  aud: "https://appleid.apple.com",
  sub: CLIENT_ID,
};

const conteudo = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;

const chave = createPrivateKey(readFileSync(P8, "utf8"));
// ieee-p1363 e não DER: o formato JOSE espera r||s concatenados. Com a
// codificação padrão do Node (DER) a Apple recusa o token sem dizer por quê.
const assinatura = assinar("sha256", Buffer.from(conteudo), {
  key: chave,
  dsaEncoding: "ieee-p1363",
});

const jwt = `${conteudo}.${b64url(assinatura)}`;
writeFileSync(SAIDA, jwt);

const venc = new Date((agora + MAX) * 1000);
console.log(`Token gerado em: ${SAIDA}`);
console.log(`  kid (Key ID):   ${KEY_ID}`);
console.log(`  iss (Team ID):  ${TEAM_ID}`);
console.log(`  sub (Client ID):${CLIENT_ID}`);
console.log(`  expira em:      ${venc.toLocaleDateString("pt-BR")} (${venc.toISOString()})`);
console.log(`  tamanho:        ${jwt.length} caracteres`);
console.log(`  confere:        ${jwt.split(".").length === 3 ? "3 partes, ok" : "MALFORMADO"}`);
