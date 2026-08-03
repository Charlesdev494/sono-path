import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * "Punho Anterior" -> "punho-anterior".
 *
 * O slug é o endereço do conteúdo e tem restrição de unicidade no banco, então
 * precisa sair limpo: sem acento, sem maiúscula, sem espaço. O NFD separa a
 * letra do acento e o intervalo U+0300–U+036F apaga só os acentos soltos.
 */
export function gerarSlug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
