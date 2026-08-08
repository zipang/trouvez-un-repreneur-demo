// js/car-model.js
// Lookup plaque -> marque / modèle / année, avec cache localStorage.
// getCarModel(plateNumber) : renvoie { plate, brand, model, year }.
// D'abord localStorage (pas de double appel API), sinon fetch de l'API Vercel.
const API_URL = "/api/get-car-model";
const STORAGE_KEY = "car-model-cache:v1";

function readCache() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}

function writeCache(cache) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
	} catch {
		// Stockage indisponible (mode privé…) : on ignore.
	}
}

// Normalise une saisie libre en plaque au format XX-999-XX.
// Renvoie "" si le contenu n'est pas une plaque SIV valide.
export function formatPlate(raw) {
	if (!raw) return "";
	const cleaned = String(raw)
		.toUpperCase()
		.replace(/[^A-Z0-9]/g, "");
	if (!/^[A-Z]{2}\d{3}[A-Z]{2}$/.test(cleaned)) return "";
	return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
}

export async function getCarModel(plateNumber) {
	const cache = readCache();
	const hit = cache[plateNumber];
	if (hit) return { plate: plateNumber, ...hit };

	const res = await fetch(`${API_URL}?plate=${encodeURIComponent(plateNumber)}`);
	if (!res.ok) throw new Error(`Réponse API ${res.status}`);
	const car = await res.json();
	writeCache({
		...cache,
		[car.plate]: { brand: car.brand, model: car.model, year: car.year }
	});
	return car;
}
