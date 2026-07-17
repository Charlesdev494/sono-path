import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { getSupabaseBrowserClient } from "./supabase/client";
import type { Database } from "./supabase/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  /** false enquanto a sessão ainda não foi lida — evite redirecionar antes disso. */
  pronto: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  pronto: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [pronto, setPronto] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setPronto(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSession(novaSessao);
      setPronto(true);
      // Trocar de conta sem limpar o cache mostraria o progresso do usuário
      // anterior para o novo.
      queryClient.clear();
    });

    return () => sub.subscription.unsubscribe();
  }, [queryClient]);

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, pronto }),
    [session, pronto],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Perfil do banco (nome, especialidade, role...). */
export function useProfile() {
  const { user, pronto } = useAuth();

  const query = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<Profile | null> => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return {
    profile: query.data ?? null,
    // "carregando" cobre o intervalo entre ter sessão e ter o perfil: sem isso
    // o app pisca a tela de onboarding para quem já preencheu.
    carregando: !pronto || (Boolean(user) && query.isLoading),
    erro: query.error,
    isAdmin: query.data?.role === "admin",
  };
}

export async function sair() {
  const supabase = getSupabaseBrowserClient();
  await supabase.auth.signOut();
}
