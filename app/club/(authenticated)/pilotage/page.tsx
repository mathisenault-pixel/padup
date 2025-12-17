export default function PilotagePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Pilotage & KPI</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">CA du jour</h3>
          <p className="text-3xl font-bold text-blue-600">2 450€</p>
          <p className="text-sm text-green-600 mt-2">+12%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Taux occupation</h3>
          <p className="text-3xl font-bold text-green-600">78%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Panier moyen</h3>
          <p className="text-3xl font-bold text-purple-600">42€</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Réservations</h3>
          <p className="text-3xl font-bold text-orange-600">24</p>
        </div>
      </div>
    </div>
  )
}

