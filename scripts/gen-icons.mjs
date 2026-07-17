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

// A arte de origem, na maior resolução disponível. Fica separada da saída de
// propósito: gerar a partir do próprio resultado degrada a imagem a cada
// execução, e apagar a saída quebraria o script (foi o que aconteceu).
const ORIGINAL = "public/icons/icon-fonte.png";
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

// Badge: o ícone pequeno na barra de status do Android quando chega uma
// notificação. O sistema descarta as cores e usa só o formato como máscara —
// por isso é branco sobre transparente, e não a arte colorida (que viraria um
// borrão sólido).
await sharp({
  create: { width: 96, height: 96, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([
    {
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24"
              fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"
              stroke-linejoin="round">
           <path d="M11 2v2"/><path d="M5 2v4a3 3 0 0 0 3 3h1"/>
           <path d="M19 2v4a3 3 0 0 1-3 3h-1"/>
           <path d="M9 9v3a3 3 0 0 0 6 0V9"/>
           <path d="M12 15v3a4 4 0 0 0 8 0v-3"/>
           <circle cx="20" cy="14" r="2"/>
         </svg>`,
      ),
      top: 0,
      left: 0,
    },
  ])
  .png({ compressionLevel: 9 })
  .toFile(`${DESTINO}/badge-96.png`);
console.log("badge-96.png (96x96, branco sobre transparente)");

console.log("\nÍcones gerados. Confira o resultado antes de publicar.");
