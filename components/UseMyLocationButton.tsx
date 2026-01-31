"use client";

import { useState } from "react";

type Coords = { lat: number; lng: number };

export default function UseMyLocationButton({
  onCoords,
}: {
  onCoords?: (coords: Coords) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askLocation = async () => {
    setError(null);

    if (!("geolocation" in navigator)) {
      setError("La géolocalisation n'est pas supportée sur cet appareil.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        // Callback avec les coordonnées
        onCoords?.(coords);

        setLoading(false);
      },
      (err) => {
        // Codes classiques: 1=refus, 2=indispo, 3=timeout
        if (err.code === 1) setError("Localisation refusée.");
        else if (err.code === 2) setError("Position indisponible.");
        else if (err.code === 3) setError("Délai dépassé.");
        else setError("Erreur de localisation.");
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60_000,
      }
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={askLocation}
        disabled={loading}
        className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {loading ? "Localisation..." : "📍 Trouver près de moi"}
      </button>

      {error && (
        <div className="text-xs text-red-600 font-medium px-2">
          {error}
        </div>
      )}
      
      <div className="text-xs text-gray-500 px-2">
        On utilise votre position uniquement pour afficher les clubs proches.
      </div>
    </div>
  );
}
