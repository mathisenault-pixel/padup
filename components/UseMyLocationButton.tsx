"use client";

import { useState } from "react";

type Coords = { lat: number; lng: number };

export default function UseMyLocationButton({
  onCoords,
  onError,
}: {
  onCoords?: (coords: Coords) => void;
  onError?: (error: string) => void;
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
        let errorMsg = "Erreur de localisation.";
        if (err.code === 1) errorMsg = "Localisation refusée.";
        else if (err.code === 2) errorMsg = "Position indisponible.";
        else if (err.code === 3) errorMsg = "Délai dépassé.";
        
        setError(errorMsg);
        onError?.(errorMsg);
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
        className={`group flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
          loading
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-black/5 text-black hover:bg-black hover:text-white border border-black/10'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {loading ? "Localisation..." : "Trouver près de moi"}
      </button>

      {error && (
        <div className="text-xs text-red-600 font-medium px-2">
          {error}
        </div>
      )}
    </div>
  );
}
