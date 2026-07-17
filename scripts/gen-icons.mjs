// Gera os ícones do PWA a partir de um único original.
//
// Existe porque o manifest declarava "512x512" para um arquivo que tinha
// 816x816 — mentira que o Chrome e o Lighthouse reclamam, e que faz o ícone
// aparecer errado em alguns aparelhos.
//
// Dois tipos de ícone, e a diferença importa:
//  - "any": a arte inteira, usada onde o sistema mostra o ícone como está.
//  - "maskable": o Android recorta o ícone numa forma (círculo, squircle) que
//    varia por fabricante. Só a "zona segura" central (~80%) sempre aparece.
//    Reaproveitar a arte "any" como maskable corta as bordas; por isso aqui a
//    arte é reduzida e centralizada sobre o fundo da marca.
//
// Uso: npm run icons

import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const ORIGINAL = "public/icons/icon-512x512.png";
const DESTINO = "public/icons";

// mesmo azul do theme_color do manifest
const FUNDO = { r: 30, g: 58, b: 138, alpha: 1 };

const TAMANHOS_ANY = [192, 512];
const TAMANHOS_MASKABLE = [192, 512];
// iOS ignora o manifest e usa apple-touch-icon; 180 é o tamanho que ele quer.
const APPLE = 180;

await mkdir(DESTINO, { recursive: true });

for (const t of TAMANHOS_ANY) {
  await sharp(ORIGINAL)
    .resize(t, t, { fit: "contain", background: FUNDO })
    .png({ compressionLevel: 9 })
    .toFile(`${DESTINO}/icon-${t}.png`);
  console.log(`icon-${t}.png (any)`);
}

for (const t of TAMANHOS_MASKABLE) {
  // 80% da área: a zona segura que sobrevive a qualquer máscara
  const arte = Math.round(t * 0.8);
  const margem = Math.round((t - arte) / 2);
  const redimensionada = await sharp(ORIGINAL)
    .resize(arte, arte, { fit: "contain", background: { ...FUNDO, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: { width: t, height: t, channels: 4, background: FUNDO },
  })
    .composite([{ input: redimensionada, top: margem, left: margem }])
    .png({ compressionLevel: 9 })
    .toFile(`${DESTINO}/maskable-${t}.png`);
  console.log(`maskable-${t}.png (zona segura de 80%)`);
}

await sharp(ORIGINAL)
  .resize(APPLE, APPLE, { fit: "contain", background: FUNDO })
  // iOS não respeita transparência no ícone de home screen: achatar no fundo
  // da marca evita o preto que ele coloca no lugar.
  .flatten({ background: FUNDO })
  .png({ compressionLevel: 9 })
  .toFile(`${DESTINO}/apple-touch-icon.png`);
console.log(`apple-touch-icon.png (${APPLE}x${APPLE})`);

console.log("\nÍcones gerados. Confira o resultado antes de publicar.");
