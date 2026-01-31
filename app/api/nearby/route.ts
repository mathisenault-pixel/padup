import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { lat, lng } = await req.json();

    console.log("[API /nearby] Received coordinates:", { lat, lng });

    // TODO: Implémenter la logique de recherche des clubs proches
    // - Requête DB avec calcul de distance (formule de Haversine)
    // - Trier par distance
    // - Retourner les clubs les plus proches

    // Pour l'instant, on retourne juste les coordonnées reçues
    return NextResponse.json({ 
      ok: true, 
      lat, 
      lng,
      message: "Coordonnées reçues avec succès. Logique de recherche à implémenter."
    });
  } catch (error: any) {
    console.error("[API /nearby] Error:", error);
    return NextResponse.json(
      { 
        error: "Erreur lors du traitement de la localisation",
        details: error?.message 
      },
      { status: 500 }
    );
  }
}
