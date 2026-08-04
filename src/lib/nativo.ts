// Distingue o app empacotado (Capacitor, lojas) da versão web.
//
// A marca é a mesma variável que aponta o backend no build nativo — definida
// só quando NATIVE=1 (ver vite.config.ts). Preferi isso a checar
// Capacitor.isNativePlatform() em tempo de execução porque é resolvido no
// build: o código morto some do bundle da web, e não há chance de a web se
// comportar como app por engano.
export const EH_NATIVO = Boolean(import.meta.env.VITE_NATIVE_API_URL);

// O que muda dentro do app empacotado:
//
// - Instalar o PWA não faz sentido: já está instalado.
// - Web Push NÃO funciona dentro do WKWebView do iOS. O push nativo (APNs)
//   entra numa próxima versão; até lá, esconder é melhor do que oferecer um
//   botão que pede permissão e nunca entrega notificação nenhuma.
// - O login com Google ainda não tem caminho nativo: o fluxo de
//   redirecionamento não fecha em capacitor://localhost. Some no app até o
//   plugin dele entrar; na web continua normal. O Apple já tem — vai pela
//   folha nativa do iOS (ver lib/auth-apple.ts).
export const MOSTRAR_INSTALAR_PWA = !EH_NATIVO;
export const MOSTRAR_WEB_PUSH = !EH_NATIVO;
export const MOSTRAR_LOGIN_GOOGLE = !EH_NATIVO;
