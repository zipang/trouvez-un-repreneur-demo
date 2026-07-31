import cars from "./cars.json";

export function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const plate = searchParams.get("plate")?.trim();
	if (!plate) {
		return Response.json(
			{ error: "Paramètre plate manquant" },
			{ status: 400 },
		);
	}
	const car = cars[Math.floor(Math.random() * cars.length)];
	return Response.json({ plate, ...car });
}
