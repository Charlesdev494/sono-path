// Gera os assets que o @capacitor/assets consome para produzir ícone e splash
// do app nativo, a partir da mesma arte do PWA.
//
// Existe por dois motivos:
//  - o ícone da App Store tem de ter exatamente 1024x1024 e NÃO pode ter canal
//    alpha; a Apple rejeita PNG com transparência nesse slot.
//  - a splash é quadrada e enorme (2732x2732) porque o Capacitor recorta o
//    centro para caber em qualquer proporção de tela. Arte pequena no meio de
//    um fundo grande é o que evita corte no iPad.
//
// Uso: npm run assets:nativos   (depois: npx capacitor-assets generate --ios)

import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const ORIGEM = "public/icons/icon-fonte.png";
const SAIDA = "assets";

// Mesmo azul da marca usado no manifest e no gen-icons.mjs.
const FUNDO = { r: 30, g: 58, b: 138, alpha: 1 };

await mkdir(SAIDA, { recursive: true });

// --- Ícone -----------------------------------------------------------------
// flatten() remove o alpha achatando contra o fundo da marca. Sem isso o
// upload falha na validação, não na revisão — erro chato de descobrir tarde.
await sharp(ORIGEM)
  .resize(1024, 1024, { fit: "contain", background: FUNDO })
  .flatten({ background: FUNDO })
  .png()
  .toFile(`${SAIDA}/icon.png`);

// --- Splash ----------------------------------------------------------------
// A arte ocupa ~30% do quadrado: o resto é margem para o recorte de qualquer
// tela cair sempre dentro do fundo sólido.
const LADO = 2732;
const ARTE = Math.round(LADO * 0.3);

const arte = await sharp(ORIGEM)
  .resize(ARTE, ARTE, { fit: "contain", background: { ...FUNDO, alpha: 0 } })
  .png()
  .toBuffer();

const splash = () =>
  sharp({ create: { width: LADO, height: LADO, channels: 4, background: FUNDO } })
    .composite([{ input: arte, gravity: "center" }])
    // O fundo é sólido: sem o alpha o arquivo fica bem menor e nada muda na tela.
    .flatten({ background: FUNDO })
    .png();

await splash().toFile(`${SAIDA}/splash.png`);
// O Capacitor espera um arquivo separado para o modo escuro. O fundo da marca
// já é escuro, então a mesma arte serve nos dois.
await splash().toFile(`${SAIDA}/splash-dark.png`);

console.log("assets/icon.png (1024, sem alpha), splash.png e splash-dark.png (2732) gerados.");
