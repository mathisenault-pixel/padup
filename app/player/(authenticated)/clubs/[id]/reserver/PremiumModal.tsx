'use client'

import { useState } from 'react'

type Props = {
  onClose: () => void
  onSubscribe: () => void
  onContinueWithout: () => void
  clubName: string
  normalPrice: number
}

type MenuItem = {
  id: string
  nom: string
  categorie: 'Boissons' | 'Snacks' | 'Repas' | 'Desserts'
  prix: number
  icon: string
}

const menuItems: MenuItem[] = [
  // Boissons
  { id: '1', nom: 'Eau minérale', categorie: 'Boissons', prix: 2.5, icon: '💧' },
  { id: '2', nom: 'Coca-Cola', categorie: 'Boissons', prix: 3, icon: '🥤' },
  { id: '3', nom: 'Jus d\'orange', categorie: 'Boissons', prix: 4, icon: '🍊' },
  { id: '4', nom: 'Café', categorie: 'Boissons', prix: 2, icon: '☕' },
  { id: '5', nom: 'Smoothie', categorie: 'Boissons', prix: 5, icon: '🥤' },
  
  // Snacks
  { id: '6', nom: 'Chips', categorie: 'Snacks', prix: 3, icon: '🥔' },
  { id: '7', nom: 'Barre énergétique', categorie: 'Snacks', prix: 2.5, icon: '🍫' },
  { id: '8', nom: 'Fruits frais', categorie: 'Snacks', prix: 3.5, icon: '🍎' },
  
  // Repas
  { id: '9', nom: 'Sandwich club', categorie: 'Repas', prix: 8, icon: '🥪' },
  { id: '10', nom: 'Salade Caesar', categorie: 'Repas', prix: 9, icon: '🥗' },
  { id: '11', nom: 'Burger maison', categorie: 'Repas', prix: 12, icon: '🍔' },
  { id: '12', nom: 'Pâtes carbonara', categorie: 'Repas', prix: 11, icon: '🍝' },
  
  // Desserts
  { id: '13', nom: 'Brownie', categorie: 'Desserts', prix: 4, icon: '🍰' },
  { id: '14', nom: 'Tiramisu', categorie: 'Desserts', prix: 5, icon: '🍮' },
]

export default function PremiumModal({ onClose, onSubscribe, onContinueWithout, clubName, normalPrice }: Props) {
  const [isPadupPlus, setIsPadupPlus] = useState(false)
  const [selectedItems, setSelectedItems] = useState<{[key: string]: number}>({}) // itemId -> quantité
  const [selectedCategorie, setSelectedCategorie] = useState<string>('Toutes')
  const [isProcessing, setIsProcessing] = useState(false) // Guard anti double-clic
  
  const categories = ['Toutes', 'Boissons', 'Snacks', 'Repas', 'Desserts']
  
  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newItems = { ...prev }
      if (newItems[itemId]) {
        if (newItems[itemId] === 1) {
          delete newItems[itemId]
        } else {
          newItems[itemId]--
        }
      } else {
        newItems[itemId] = 1
      }
      return newItems
    })
  }
  
  const incrementItem = (itemId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }))
  }
  
  const filteredItems = selectedCategorie === 'Toutes' 
    ? menuItems 
    : menuItems.filter(item => item.categorie === selectedCategorie)
  
  const totalRestaurant = Object.entries(selectedItems).reduce((sum, [itemId, qty]) => {
    const item = menuItems.find(i => i.id === itemId)
    return sum + (item ? item.prix * qty : 0)
  }, 0)
  
  const remiseRestaurant = isPadupPlus ? totalRestaurant * 0.2 : 0
  const totalRestaurantFinal = totalRestaurant - remiseRestaurant
  
  const totalGeneral = normalPrice + totalRestaurantFinal
  
  const handleFinalConfirmation = () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    
    try {
      if (isPadupPlus) {
        onSubscribe()
      } else {
        onContinueWithout()
      }
    } finally {
      // Le modal sera fermé par le parent, pas besoin de resetIsProcessing ici
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Finalisez votre réservation
          </h3>
          <p className="text-gray-600">
            {clubName} · Terrain + Restauration
          </p>
        </div>
        
        {/* Abonnement Pad'up + - ULTRA ATTRACTIF */}
        <div className={`rounded-2xl p-6 mb-6 border-3 transition-all cursor-pointer relative overflow-hidden ${
          isPadupPlus 
            ? 'bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 border-blue-600 shadow-2xl' 
            : 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-blue-500 shadow-xl hover:shadow-2xl'
        }`} onClick={() => setIsPadupPlus(!isPadupPlus)}>
          
          {/* Badge PROMO en haut à droite */}
          <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-black text-sm shadow-lg transform rotate-3 animate-pulse">
            🎉 PROMO -20%
          </div>
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                isPadupPlus ? 'bg-white' : 'bg-blue-600'
              }`}>
                <svg className={`w-10 h-10 ${isPadupPlus ? 'text-blue-600' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className={`font-black text-2xl ${isPadupPlus ? 'text-white' : 'text-white'}`}>
                    Abonnement Pad'up +
                  </h4>
                  {isPadupPlus && (
                    <span className="px-3 py-1 bg-white text-blue-600 text-sm rounded-full font-bold shadow-md">
                      ✓ Activé
                    </span>
                  )}
                </div>
                
                <div className={`text-sm mb-3 ${isPadupPlus ? 'text-blue-100' : 'text-gray-300'}`}>
                  Économisez sur tous vos repas au club 🍽️
                </div>
                
                {/* Prix avec promo */}
                <div className="flex items-baseline gap-3 mb-3">
                  <div className={`text-lg line-through opacity-60 ${isPadupPlus ? 'text-blue-200' : 'text-gray-400'}`}>
                    12,49€
                  </div>
                  <div className={`text-4xl font-black ${isPadupPlus ? 'text-white' : 'text-yellow-400'}`}>
                    9,99€
                  </div>
                  <div className={`text-sm ${isPadupPlus ? 'text-blue-100' : 'text-gray-300'}`}>
                    /mois
                  </div>
                </div>
                
                <div className={`text-xs font-semibold ${isPadupPlus ? 'text-blue-100' : 'text-gray-400'}`}>
                  Sans engagement · Résiliable à tout moment
                </div>
              </div>
            </div>
            
            {/* Badge -20% sur restauration */}
            <div className="text-center">
              <div className={`text-5xl font-black mb-1 ${isPadupPlus ? 'text-white' : 'text-yellow-400'}`}>
                -20%
              </div>
              <div className={`text-xs font-bold uppercase ${isPadupPlus ? 'text-blue-100' : 'text-gray-300'}`}>
                Restauration
              </div>
            </div>
          </div>
          
          {/* Avantages mini-liste */}
          <div className={`mt-4 pt-4 border-t ${isPadupPlus ? 'border-blue-400' : 'border-gray-600'}`}>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { icon: '🍽️', text: '-20% sur tous les repas' },
                { icon: '⚡', text: 'Réservations prioritaires' },
                { icon: '🎯', text: 'Créneaux exclusifs' },
                { icon: '🎾', text: 'Tournois membres +' },
              ].map((benefit, idx) => (
                <div key={idx} className={`flex items-center gap-2 font-semibold ${isPadupPlus ? 'text-white' : 'text-gray-200'}`}>
                  <span className="text-lg">{benefit.icon}</span>
                  <span className="text-xs">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Call to action */}
          {!isPadupPlus && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-black text-sm shadow-lg">
                👆 Cliquez pour activer et économiser
              </div>
            </div>
          )}
        </div>
        
        {/* Menu Restauration */}
        <div className="mb-6">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            Menu Restauration
            {isPadupPlus && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">
                -20% appliqués
              </span>
            )}
          </h4>
          
          {/* Filtres catégories */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategorie(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategorie === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          {/* Items menu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {filteredItems.map(item => {
              const qty = selectedItems[item.id] || 0
              const prixFinal = isPadupPlus ? item.prix * 0.8 : item.prix
              
              return (
                <div
                  key={item.id}
                  className={`border-2 rounded-lg p-3 transition-all ${
                    qty > 0
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-sm">{item.nom}</div>
                        <div className="flex items-center gap-2">
                          {isPadupPlus && (
                            <span className="text-xs text-gray-400 line-through">{item.prix.toFixed(2)}€</span>
                          )}
                          <span className={`font-bold text-sm ${isPadupPlus ? 'text-blue-600' : 'text-gray-900'}`}>
                            {prixFinal.toFixed(2)}€
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {qty > 0 ? (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleItem(item.id)}
                            className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center font-bold"
                          >
                            −
                          </button>
                          <span className="w-6 text-center font-bold">{qty}</span>
                          <button
                            type="button"
                            onClick={() => incrementItem(item.id)}
                            className="w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => incrementItem(item.id)}
                          className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold"
                        >
                          Ajouter
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Récapitulatif avec comparaison */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6 border-2 border-gray-200">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">📋</span>
            Récapitulatif
          </h4>
          
          <div className="space-y-3 text-sm">
            {/* Réservation terrain */}
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 font-medium">Réservation terrain</span>
              <span className="font-bold text-gray-900">{normalPrice.toFixed(2)}€</span>
            </div>
            
            {/* Restauration avec comparaison si items sélectionnés */}
            {Object.keys(selectedItems).length > 0 && (
              <>
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 font-medium">Restauration</span>
                    <span className={isPadupPlus ? 'line-through text-gray-400' : 'font-bold text-gray-900'}>
                      {totalRestaurant.toFixed(2)}€
                    </span>
                  </div>
                  
                  {isPadupPlus ? (
                    <>
                      <div className="flex justify-between items-center text-green-600 font-semibold mb-1">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Remise Pad'up + (-20%)
                        </span>
                        <span>-{remiseRestaurant.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Restauration avec Pad'up +</span>
                        <span className="font-bold text-blue-600 text-lg">{totalRestaurantFinal.toFixed(2)}€</span>
                      </div>
                    </>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">💡</span>
                        <div className="flex-1">
                          <div className="font-bold text-yellow-800 text-xs mb-1">
                            Économisez avec Pad'up + !
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-yellow-700">Prix avec abonnement :</span>
                            <span className="font-black text-blue-600">{totalRestaurantFinal.toFixed(2)}€</span>
                          </div>
                          <div className="text-xs text-green-600 font-bold mt-1">
                            ✓ Vous économisez {remiseRestaurant.toFixed(2)}€ sur ce repas !
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* Abonnement si activé */}
            {isPadupPlus && (
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">Abonnement Pad'up +</span>
                    <span className="text-xs text-gray-500">(premier mois)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 line-through">12,49€</div>
                    <span className="font-bold text-blue-600">9,99€</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Total avec mise en avant des économies */}
            <div className="border-t-2 border-gray-400 pt-3 mt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-900 text-lg">Total à payer</span>
                <span className="font-black text-gray-900 text-2xl">
                  {(totalGeneral + (isPadupPlus ? 9.99 : 0)).toFixed(2)}€
                </span>
              </div>
              
              {/* Message d'économie si Pad'up + activé */}
              {isPadupPlus && Object.keys(selectedItems).length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                  <div className="flex items-center gap-2 text-green-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <div className="font-bold text-sm">Bravo !</div>
                      <div className="text-xs">
                        Vous économisez <span className="font-bold">{(remiseRestaurant + 2.5).toFixed(2)}€</span> sur cette commande 🎉
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        (Remise resto {remiseRestaurant.toFixed(2)}€ + Promo abonnement 2,50€)
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Message incitatif si pas d'abonnement */}
              {!isPadupPlus && Object.keys(selectedItems).length > 0 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mt-2">
                  <div className="flex items-center gap-2 text-blue-700">
                    <span className="text-2xl">🎯</span>
                    <div className="flex-1">
                      <div className="font-black text-sm mb-1">
                        Activez Pad'up + et payez seulement {(totalGeneral - remiseRestaurant + 9.99).toFixed(2)}€ !
                      </div>
                      <div className="text-xs">
                        ✓ Économie immédiate de <span className="font-bold">{remiseRestaurant.toFixed(2)}€</span> sur ce repas<br/>
                        ✓ -20% sur tous vos futurs repas au club<br/>
                        ✓ Abonnement à <span className="font-bold line-through">12,49€</span> <span className="font-bold text-blue-600">9,99€/mois</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleFinalConfirmation}
            disabled={isProcessing}
            className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
              isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isProcessing ? '⏳ Traitement...' : '✅ Confirmer la réservation'}
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-semibold transition-all"
          >
            ← Retour en arrière
          </button>
        </div>
      </div>
    </div>
  )
}
