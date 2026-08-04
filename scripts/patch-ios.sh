#!/bin/sh
# Ajustes no projeto iOS gerados pelo "npx cap add ios".
#
# A pasta ios/ não fica no repositório: é recriada a cada build na máquina
# macOS do CI (ver codemagic.yaml). Como o "cap add" reescreve o Info.plist a
# partir do template, qualquer ajuste feito à mão se perderia — por isso ele
# mora aqui, num script que roda sempre depois.
#
# Uso: sh scripts/patch-ios.sh
set -e

PLIST="ios/App/App/Info.plist"

if [ ! -f "$PLIST" ]; then
  echo "Info.plist não encontrado em $PLIST. Rode 'npx cap add ios' antes."
  exit 1
fi

# O nome que aparece embaixo do ícone na tela de início. O padrão vira o appName
# inteiro, que estoura e vira "US36...".
/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName US360" "$PLIST" \
  || /usr/libexec/PlistBuddy -c "Add :CFBundleDisplayName string US360" "$PLIST"

# Declaração de criptografia. O app só usa HTTPS, que é criptografia padrão do
# sistema e isenta de documentação de exportação. Sem esta chave, o App Store
# Connect pergunta isso a cada envio de build e trava o processamento.
/usr/libexec/PlistBuddy -c "Set :ITSAppUsesNonExemptEncryption false" "$PLIST" \
  || /usr/libexec/PlistBuddy -c "Add :ITSAppUsesNonExemptEncryption bool false" "$PLIST"

# A barra de status é controlada pelo plugin do Capacitor, não por cada tela.
/usr/libexec/PlistBuddy -c "Set :UIViewControllerBasedStatusBarAppearance false" "$PLIST" \
  || /usr/libexec/PlistBuddy -c "Add :UIViewControllerBasedStatusBarAppearance bool false" "$PLIST"

echo "Info.plist ajustado:"
/usr/libexec/PlistBuddy -c "Print :CFBundleDisplayName" "$PLIST"
/usr/libexec/PlistBuddy -c "Print :ITSAppUsesNonExemptEncryption" "$PLIST"

# ---------------------------------------------------------------------------
# Sign in with Apple
# ---------------------------------------------------------------------------
# Sem este entitlement o plugin compila, o botão aparece, e a folha da Apple
# simplesmente não abre no aparelho — falha em tempo de execução, não de build.
# O provisioning profile já autoriza (a capability está ligada no App ID); o
# que falta é o binário declarar que usa.
ENTITLEMENTS="ios/App/App/App.entitlements"

# aps-environment=production: builds do TestFlight e da App Store falam com o
# APNs de produção. "development" só vale para app instalado pelo Xcode — usar
# o valor errado faz o token ser recusado com BadDeviceToken, sem pista do que
# está errado.
#
# com.apple.developer.game-center acompanha a capability ligada no App ID. São
# dois lados: o App ID autoriza, o binário declara. Ligar só no portal faz a
# App Store Connect recusar o envio com "adicione a chave
# com.apple.developer.game-center no Xcode" — que era o caso aqui, e não dava
# para resolver no Xcode porque a pasta ios/ é gerada a cada build.
#
# O entitlement não cria funcionalidade: placar e conquista nativos exigiriam
# GameKit. Hoje o ranking e as conquistas do US360 vivem no Supabase.
cat > "$ENTITLEMENTS" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.developer.applesignin</key>
  <array>
    <string>Default</string>
  </array>
  <key>aps-environment</key>
  <string>production</string>
  <key>com.apple.developer.game-center</key>
  <true/>
</dict>
</plist>
PLIST

# Aponta o build para o arquivo. CODE_SIGN_ENTITLEMENTS é só um caminho
# relativo ao SRCROOT (ios/App), então não é preciso registrar o arquivo na
# árvore do Xcode — basta a configuração existir em cada build config.
PBXPROJ="ios/App/App.xcodeproj/project.pbxproj"
if grep -q "CODE_SIGN_ENTITLEMENTS" "$PBXPROJ"; then
  echo "CODE_SIGN_ENTITLEMENTS já presente."
else
  # PRODUCT_BUNDLE_IDENTIFIER aparece uma vez por configuração (Debug/Release)
  # do alvo App — é a âncora estável para inserir ao lado.
  sed -i '' 's|PRODUCT_BUNDLE_IDENTIFIER = |CODE_SIGN_ENTITLEMENTS = App/App.entitlements;\
\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = |g' "$PBXPROJ"
fi

# Falhar aqui é muito melhor do que descobrir no aparelho que o login não abre.
N=$(grep -c "CODE_SIGN_ENTITLEMENTS = App/App.entitlements" "$PBXPROJ" || true)
if [ "$N" -lt 1 ]; then
  echo "Não consegui inserir CODE_SIGN_ENTITLEMENTS no projeto Xcode."
  exit 1
fi
echo "Entitlements aplicados em $N configuração(ões)."

# ---------------------------------------------------------------------------
# Só iPhone
# ---------------------------------------------------------------------------
# O template do Capacitor vem com "1,2" (iPhone + iPad). Declarar iPad faz a
# App Store Connect exigir capturas de tela de 13" para aceitar o envio — e o
# revisor abrir o app num iPad, onde o layout nunca foi conferido.
#
# Voltar a ser universal é trocar este valor por "1,2" de novo, depois de
# testar as telas em tela grande.
sed -i '' 's|TARGETED_DEVICE_FAMILY = "1,2";|TARGETED_DEVICE_FAMILY = "1";|g' "$PBXPROJ"

# Se o template mudar o formato desta linha, o sed passa batido em silêncio e o
# app volta a ser universal sem ninguém perceber — até a Apple cobrar o print
# de iPad de novo. Por isso a conferência é uma falha de build.
FAMILIA=$(grep -c 'TARGETED_DEVICE_FAMILY = "1";' "$PBXPROJ" || true)
SOBROU=$(grep -c 'TARGETED_DEVICE_FAMILY = "1,2";' "$PBXPROJ" || true)
if [ "$FAMILIA" -lt 1 ] || [ "$SOBROU" -gt 0 ]; then
  echo "TARGETED_DEVICE_FAMILY não ficou em iPhone-only."
  echo "Encontrado: $FAMILIA em \"1\", $SOBROU ainda em \"1,2\"."
  exit 1
fi
echo "App marcado como iPhone-only em $FAMILIA configuração(ões)."
