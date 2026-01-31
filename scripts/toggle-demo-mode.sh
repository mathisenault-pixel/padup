#!/bin/bash

# Script pour activer/désactiver le mode démo de Pad'Up
# Usage: ./scripts/toggle-demo-mode.sh [on|off]

ENV_FILE=".env.local"

function show_usage() {
  echo "Usage: $0 [on|off]"
  echo ""
  echo "  on  - Active le mode démo"
  echo "  off - Désactive le mode démo"
  echo ""
  exit 1
}

function enable_demo_mode() {
  echo "🎭 Activation du mode démo..."
  
  # Créer ou mettre à jour .env.local
  if [ -f "$ENV_FILE" ]; then
    # Vérifier si NEXT_PUBLIC_DEMO_MODE existe déjà
    if grep -q "NEXT_PUBLIC_DEMO_MODE" "$ENV_FILE"; then
      # Remplacer la valeur existante
      sed -i.bak 's/NEXT_PUBLIC_DEMO_MODE=.*/NEXT_PUBLIC_DEMO_MODE=true/' "$ENV_FILE"
      rm -f "${ENV_FILE}.bak"
    else
      # Ajouter la variable
      echo "" >> "$ENV_FILE"
      echo "# Mode Démo" >> "$ENV_FILE"
      echo "NEXT_PUBLIC_DEMO_MODE=true" >> "$ENV_FILE"
    fi
  else
    # Créer le fichier .env.local
    cat > "$ENV_FILE" << EOF
# Mode Démo - Désactive Supabase et utilise des données locales
NEXT_PUBLIC_DEMO_MODE=true

# Ces variables ne sont pas utilisées en mode démo
# mais peuvent être nécessaires pour éviter des erreurs de build
NEXT_PUBLIC_SUPABASE_URL=https://demo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-key
EOF
  fi
  
  echo "✅ Mode démo activé !"
  echo ""
  echo "📝 Pour démarrer l'application : npm run dev"
  echo "📖 Documentation complète : voir DEMO_MODE.md"
}

function disable_demo_mode() {
  echo "🔌 Désactivation du mode démo..."
  
  if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  Fichier .env.local introuvable"
    exit 1
  fi
  
  # Remplacer la valeur par false
  if grep -q "NEXT_PUBLIC_DEMO_MODE" "$ENV_FILE"; then
    sed -i.bak 's/NEXT_PUBLIC_DEMO_MODE=.*/NEXT_PUBLIC_DEMO_MODE=false/' "$ENV_FILE"
    rm -f "${ENV_FILE}.bak"
    echo "✅ Mode démo désactivé !"
    echo ""
    echo "⚠️  N'oubliez pas de configurer vos vraies credentials Supabase dans .env.local"
  else
    echo "⚠️  Variable NEXT_PUBLIC_DEMO_MODE introuvable dans .env.local"
  fi
}

# Vérifier les arguments
if [ $# -ne 1 ]; then
  show_usage
fi

case "$1" in
  on)
    enable_demo_mode
    ;;
  off)
    disable_demo_mode
    ;;
  *)
    show_usage
    ;;
esac



