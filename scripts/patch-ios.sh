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
