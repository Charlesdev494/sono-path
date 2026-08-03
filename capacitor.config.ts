import type { CapacitorConfig } from "@capacitor/cli";

// Empacotamento nativo do US360.
//
// appId tem de ser IDÊNTICO ao App ID registrado no Apple Developer
// (com.drcharles.sonopath). Um caractere diferente e o upload é recusado na
// validação, com uma mensagem que não explica o motivo.
//
// webDir aponta para a saída do build nativo (NATIVE=1 npm run build), que é a
// única que gera index.html. O build da web, em .output/, não serve aqui.
const config: CapacitorConfig = {
  appId: "com.drcharles.sonopath",
  appName: "US360",
  webDir: "dist/client",

  ios: {
    // Fundo por trás da webview enquanto a página monta e durante o bounce do
    // scroll. Sem isto aparece branco, que pisca feio contra o azul da marca.
    backgroundColor: "#1e3a8a",
    // O app já trata a safe area no CSS (env(safe-area-inset-*)); deixar o
    // Capacitor também recuar produziria margem dupla.
    contentInset: "never",
  },

  // Nada de server.url aqui. Apontar a webview para o site remoto faria a Apple
  // rejeitar por Guideline 4.2 ("app é só um navegador"). Os arquivos vão
  // dentro do pacote.
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#1e3a8a",
      showSpinner: false,
      // Sem isto a splash some antes de o React montar e aparece um flash
      // branco entre uma coisa e outra.
      launchAutoHide: true,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#1e3a8a",
    },
  },
};

export default config;
