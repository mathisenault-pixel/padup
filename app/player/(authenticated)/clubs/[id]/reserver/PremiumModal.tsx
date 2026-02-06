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
    if (isProcessing) {
      console.log('[PREMIUM MODAL] handleFinalConfirmation BLOCKED - already processing')
      return
    }
    
    console.log('[PREMIUM MODAL] handleFinalConfirmation START')
    setIsProcessing(true)
    
    // ✅ requestAnimationFrame plus performant que setTimeout
    requestAnimationFrame(() => {
      try {
        console.log('[PREMIUM MODAL] handleFinalConfirmation EXECUTING callback')
        if (isPadupPlus) {
          onSubscribe()
        } else {
          onContinueWithout()
        }
        console.log('[PREMIUM MODAL] handleFinalConfirmation DONE')
      } catch (error) {
        console.error('[PREMIUM MODAL] ERROR:', error)
        setIsProcessing(false)
      }
    })
  }
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4 py-8">
        <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl">
          <div className="px-4 sm:px-6 py-8 sm:py-12">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h3 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-2">
              Finalisez votre réservation
            </h3>
            <p className="text-base sm:text-lg text-slate-500">
              {clubName} · Terrain + Restauration
            </p>
          </div>
          
          {/* Layout 2 colonnes sur desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Colonne gauche - Abonnement + Menu */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Abonnement Pad'up + */}
              <div 
                onClick={() => setIsPadupPlus(!isPadupPlus)}
                className={`rounded-2xl bg-white border shadow-sm p-5 sm:p-6 cursor-pointer transition-all ${
                  isPadupPlus 
                    ? 'border-slate-900 shadow-md' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Badge PROMO en haut à droite */}
                {!isPadupPlus && (
                  <div className="float-right rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                    -20% restauration
                  </div>
                )}
                
                <div className="flex items-start gap-4 clear-both">
                  {/* Icône */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isPadupPlus ? 'bg-slate-900' : 'bg-slate-50'
                  }`}>
                    <svg className={`w-6 h-6 ${isPadupPlus ? 'text-white' : 'text-slate-700'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  
                  {/* Contenu */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-semibold text-slate-900">
                        Abonnement Pad'up +
                      </h4>
                      {isPadupPlus && (
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700">
                          ✓ Activé
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-500 mb-3">
                      Économisez 20% sur tous vos repas au club
                    </p>
                    
                    {/* Prix */}
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-sm text-slate-400 line-through">12,49€</span>
                      <span className="text-2xl font-semibold text-slate-900">9,99€</span>
                      <span className="text-sm text-slate-500">/mois</span>
                    </div>
                    
                    <p className="text-xs text-slate-500">
                      Sans engagement · Résiliable à tout moment
                    </p>
                  </div>
                  
                  {/* Badge -20% */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900">-20%</div>
                    <div className="text-xs font-medium text-slate-500">Resto</div>
                  </div>
                </div>
                
                {/* Séparateur */}
                <div className="border-t border-slate-200 my-4"></div>
                
                {/* Avantages */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: '🍽️', text: '-20% repas' },
                    { icon: '⚡', text: 'Prioritaire' },
                    { icon: '🎯', text: 'Créneaux exclusifs' },
                    { icon: '🎾', text: 'Tournois +' },
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-base">{benefit.icon}</span>
                      <span className="text-xs font-medium text-slate-600">{benefit.text}</span>
                    </div>
                  ))}
                </div>
                
                {/* CTA si pas activé */}
                {!isPadupPlus && (
                  <div className="mt-4">
                    <div className="text-center text-xs font-medium text-slate-600 bg-slate-50 rounded-xl py-2 px-3 border border-slate-200">
                      👆 Cliquez pour activer et économiser
                    </div>
                  </div>
                )}
              </div>
              
              {/* Menu Restauration */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="text-lg font-semibold text-slate-900">Menu Restauration</h4>
                  {isPadupPlus && (
                    <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      -20% appliqués
                    </span>
                  )}
                </div>
                
                {/* Filtres catégories */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                  {categories.map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setSelectedCategorie(cat)}
                      className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all ${
                        selectedCategorie === cat
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                
                {/* Items menu */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredItems.map(item => {
                    const qty = selectedItems[item.id] || 0
                    const prixFinal = isPadupPlus ? item.prix * 0.8 : item.prix
                    
                    return (
                      <div
                        key={item.id}
                        className={`rounded-xl border p-4 transition-all ${
                          qty > 0
                            ? 'border-slate-900 bg-slate-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-xl flex-shrink-0">{item.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-900 text-sm">{item.nom}</div>
                              <div className="flex items-center gap-2">
                                {isPadupPlus && (
                                  <span className="text-xs text-slate-400 line-through">{item.prix.toFixed(2)}€</span>
                                )}
                                <span className="font-semibold text-sm text-slate-900">
                                  {prixFinal.toFixed(2)}€
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {qty > 0 ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => toggleItem(item.id)}
                                  className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center font-semibold text-slate-700 transition-colors"
                                >
                                  −
                                </button>
                                <span className="w-6 text-center font-semibold text-slate-900">{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => incrementItem(item.id)}
                                  className="w-7 h-7 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center font-semibold transition-colors"
                                >
                                  +
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => incrementItem(item.id)}
                                className="h-9 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors"
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
            </div>
            
            {/* Colonne droite - Récapitulatif (sticky) */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6 lg:sticky lg:top-4">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Récapitulatif</h4>
                
                <div className="space-y-3">
                  {/* Réservation terrain */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Réservation terrain</span>
                    <span className="text-sm font-semibold text-slate-900">{normalPrice.toFixed(2)}€</span>
                  </div>
                  
                  {/* Restauration avec comparaison si items sélectionnés */}
                  {Object.keys(selectedItems).length > 0 && (
                    <>
                      <div className="border-t border-slate-200 pt-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-slate-600">Restauration</span>
                          <span className={isPadupPlus ? 'text-sm text-slate-400 line-through' : 'text-sm font-semibold text-slate-900'}>
                            {totalRestaurant.toFixed(2)}€
                          </span>
                        </div>
                        
                        {isPadupPlus ? (
                          <>
                            <div className="flex justify-between items-center text-green-600 text-sm mb-1">
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs">Remise -20%</span>
                              </span>
                              <span className="text-xs font-medium">-{remiseRestaurant.toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600">Resto avec Pad'up +</span>
                              <span className="text-sm font-semibold text-slate-900">{totalRestaurantFinal.toFixed(2)}€</span>
                            </div>
                          </>
                        ) : (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mt-2">
                            <div className="text-xs font-medium text-yellow-800 mb-1">
                              💡 Activez Pad'up + pour économiser
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-yellow-700">Prix avec abonnement :</span>
                              <span className="font-semibold text-slate-900">{totalRestaurantFinal.toFixed(2)}€</span>
                            </div>
                            <div className="text-xs text-green-600 font-medium mt-1">
                              ✓ Économie : {remiseRestaurant.toFixed(2)}€
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {/* Abonnement si activé */}
                  {isPadupPlus && (
                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-slate-600">Abonnement Pad'up +</span>
                          <span className="text-xs text-slate-400 ml-1">(1er mois)</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-400 line-through">12,49€</div>
                          <span className="text-sm font-semibold text-slate-900">9,99€</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Total */}
                  <div className="border-t border-slate-900 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold text-slate-900">Total à payer</span>
                      <span className="text-2xl font-semibold text-slate-900">
                        {(totalGeneral + (isPadupPlus ? 9.99 : 0)).toFixed(2)}€
                      </span>
                    </div>
                  </div>
                  
                  {/* Message d'économie si Pad'up + activé */}
                  {isPadupPlus && Object.keys(selectedItems).length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-3">
                      <div className="flex items-start gap-2 text-green-700">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <div className="font-semibold text-xs mb-1">Bravo !</div>
                          <div className="text-xs">
                            Économie : <span className="font-semibold">{(remiseRestaurant + 2.5).toFixed(2)}€</span>
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            (Resto {remiseRestaurant.toFixed(2)}€ + Promo 2,50€)
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Message incitatif si pas d'abonnement */}
                  {!isPadupPlus && Object.keys(selectedItems).length > 0 && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mt-3">
                      <div className="text-xs font-medium text-slate-900 mb-2">
                        💡 Avec Pad'up + : {(totalGeneral - remiseRestaurant + 9.99).toFixed(2)}€
                      </div>
                      <div className="text-xs text-slate-600 space-y-1">
                        <div>✓ Économie : {remiseRestaurant.toFixed(2)}€</div>
                        <div>✓ -20% sur futurs repas</div>
                        <div>✓ Abo : <span className="line-through">12,49€</span> 9,99€/mois</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Boutons d'action */}
                  <div className="mt-6 space-y-3">
                    <button
                      type="button"
                      onClick={handleFinalConfirmation}
                      disabled={isProcessing}
                      className={`w-full h-12 rounded-2xl text-base font-semibold transition-all ${
                        isProcessing
                          ? 'bg-slate-400 cursor-not-allowed text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isProcessing ? 'Traitement...' : 'Confirmer la réservation'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full h-10 rounded-xl text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-900 transition-colors"
                    >
                      Retour
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
