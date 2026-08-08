import carsJson from "./cars.json";

type Car = { brand: string; model: string; year: number };
const cars = carsJson as Record<string, Car>;

export function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const plate = searchParams.get("plate")?.trim();
	if (!plate) {
		return Response.json({ error: "Paramètre plate manquant" }, { status: 400 });
	}
	const car = cars[plate];
	if (!car) {
		return Response.json({ error: `Aucun véhicule connu pour la plaque ${plate}` }, { status: 404 });
	}
	return Response.json({ plate, ...car });
}
