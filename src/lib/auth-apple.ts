// Sign in with Apple nativo, para o app das lojas.
//
// Na web o login passa por redirecionamento: o navegador vai até a Apple e
// volta pela URL de callback. Dentro do app isso não fecha — a origem é
// capacitor://localhost, que a Apple não aceita como destino, e mesmo
// contornando ficaria uma página de login dentro de uma webview, que é
// justamente o que a Apple não quer ver.
//
// Aqui o caminho é outro: o plugin abre a folha nativa do iOS, o sistema
// devolve um identity token, e trocamos esse token por sessão direto no
// Supabase. Sem navegador, sem redirecionamento, sem volta para lugar nenhum.

import { SignInWithApple } from "@capacitor-community/apple-sign-in";

import { getSupabaseBrowserClient } from "./supabase/client";

// Precisa estar na lista "Client IDs" do provedor Apple no Supabase — é contra
// ela que o token é validado.
const BUNDLE_ID = "com.drcharles.sonopath";

/**
 * O nonce protege contra reaproveitamento do token: a Apple grava o HASH dele
 * dentro do identity token, e o Supabase confere contra o valor original que
 * mandamos junto. Por isso são dois valores — o hash vai para a Apple, o
 * original para o Supabase.
 */
async function gerarNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const original = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(original));
  const hash = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
  return { original, hash };
}

export async function entrarComAppleNativo() {
  const { original, hash } = await gerarNonce();

  const { response } = await SignInWithApple.authorize({
    clientId: BUNDLE_ID,
    // Ignorado no fluxo nativo (não há redirecionamento), mas o plugin exige o
    // campo. Fica o mesmo endereço da web para não parecer valor inventado.
    redirectURI: "https://jkaemncenclicglbjoue.supabase.co/auth/v1/callback",
    scopes: "email name",
    nonce: hash,
  });

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: response.identityToken,
    nonce: original,
  });
  if (error) throw error;

  // A Apple só manda o nome na PRIMEIRA autorização — se o app for reinstalado,
  // vem nulo para sempre. Então gravamos agora ou nunca; o onboarding usa isso
  // para não pedir de novo o que já sabemos.
  const nome = [response.givenName, response.familyName].filter(Boolean).join(" ").trim();
  if (nome && data.user) {
    const { data: perfil } = await supabase
      .from("profiles")
      .select("nome")
      .eq("id", data.user.id)
      .maybeSingle();
    // Só preenche se estiver vazio: quem já escolheu como quer ser chamado não
    // deve ter o nome sobrescrito pelo registro civil da conta Apple.
    if (perfil && !perfil.nome.trim()) {
      await supabase.from("profiles").update({ nome }).eq("id", data.user.id);
    }
  }

  return data;
}
