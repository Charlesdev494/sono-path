import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "usm:profile";

export type Profile = {
  nome: string;
  especialidade: string;
  cidade: string;
  tempoFormado: string;
  temUS: boolean;
  trabalhaDor: boolean;
  pontos: number;
  streak: number;
  ultimoAcessoISO: string | null;
  quizzesRespondidos: string[]; // ids
  quizzesHoje: { dateISO: string; ids: string[] };
  casosRespondidos: string[];
  atlasVisitados: string[];
  missoesCompletadasHoje: { dateISO: string; missoes: string[] };
  createdAtISO: string;
};

export const NIVEIS = [
  { nivel: 1, nome: "Iniciante", min: 0, max: 499 },
  { nivel: 2, nome: "Operador", min: 500, max: 1499 },
  { nivel: 3, nome: "Intervencionista", min: 1500, max: 3499 },
  { nivel: 4, nome: "Instrutor", min: 3500, max: 6999 },
  { nivel: 5, nome: "Avançado", min: 7000, max: 11999 },
  { nivel: 6, nome: "Expert", min: 12000, max: Infinity },
];

export function calcularNivel(pontos: number) {
  const atual = NIVEIS.find((n) => pontos >= n.min && pontos <= n.max) ?? NIVEIS[0];
  const proximo = NIVEIS.find((n) => n.min > atual.max);
  const faltam = proximo ? proximo.min - pontos : 0;
  const progresso = proximo
    ? Math.min(100, ((pontos - atual.min) / (proximo.min - atual.min)) * 100)
    : 100;
  return { ...atual, proximo, faltam, progresso };
}

function emptyProfile(): Profile {
  return {
    nome: "",
    especialidade: "",
    cidade: "",
    tempoFormado: "",
    temUS: false,
    trabalhaDor: false,
    pontos: 0,
    streak: 0,
    ultimoAcessoISO: null,
    quizzesRespondidos: [],
    quizzesHoje: { dateISO: "", ids: [] },
    casosRespondidos: [],
    atlasVisitados: [],
    missoesCompletadasHoje: { dateISO: "", missoes: [] },
    createdAtISO: new Date().toISOString(),
  };
}

export function loadProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return { ...emptyProfile(), ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

export function saveProfile(p: Profile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isYesterday(iso: string) {
  const d = new Date(iso);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return d.toISOString().slice(0, 10) === y.toISOString().slice(0, 10);
}

export function touchStreak(p: Profile): Profile {
  const today = todayISO();
  const last = p.ultimoAcessoISO?.slice(0, 10);
  if (last === today) return p;
  let streak = p.streak;
  if (last && isYesterday(p.ultimoAcessoISO!)) streak = streak + 1;
  else streak = 1;
  return { ...p, streak, ultimoAcessoISO: new Date().toISOString() };
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    if (p) {
      const touched = touchStreak(p);
      // reset daily slots if date changed
      const today = todayISO();
      if (touched.quizzesHoje.dateISO !== today)
        touched.quizzesHoje = { dateISO: today, ids: [] };
      if (touched.missoesCompletadasHoje.dateISO !== today)
        touched.missoesCompletadasHoje = { dateISO: today, missoes: [] };
      saveProfile(touched);
      setProfile(touched);
    }
    setLoaded(true);
  }, []);

  const update = useCallback((updater: (p: Profile) => Profile) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      saveProfile(next);
      return next;
    });
  }, []);

  const addPontos = useCallback(
    (n: number) => update((p) => ({ ...p, pontos: p.pontos + n })),
    [update],
  );

  const marcarMissao = useCallback(
    (missao: string) =>
      update((p) => {
        const today = todayISO();
        const atual =
          p.missoesCompletadasHoje.dateISO === today
            ? p.missoesCompletadasHoje.missoes
            : [];
        if (atual.includes(missao)) return p;
        return {
          ...p,
          missoesCompletadasHoje: { dateISO: today, missoes: [...atual, missao] },
        };
      }),
    [update],
  );

  return { profile, loaded, setProfile, update, addPontos, marcarMissao };
}
