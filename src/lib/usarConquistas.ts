import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";

import { verificarConquistas } from "./data/social";

/**
 * Confere conquistas depois de uma ação e avisa o aluno quando ele desbloqueia
 * alguma. Concentrado aqui para que quiz, casos e atlas não repitam a mesma
 * lógica de três formas diferentes.
 *
 * Nunca lança: perder uma medalha é chato, mas quebrar a tela do quiz por causa
 * dela seria pior.
 */
export function useConferirConquistas() {
  const qc = useQueryClient();

  return useCallback(async () => {
    const novas = await verificarConquistas();
    if (novas.length === 0) return;

    for (const b of novas) {
      toast(`${b.icone}  ${b.nome}`, { description: b.descricao, duration: 6000 });
    }
    qc.invalidateQueries({ queryKey: ["conquistas"] });
  }, [qc]);
}
