import { type Car, cars } from "./cars";
import { error, success } from "./helpers";
import { withAuth, withCors, withLog } from "./middleware";

const GET = (request: Request) => {
	const { searchParams } = new URL(request.url);
	const plate = searchParams.get("plate")?.trim();
	if (!plate) {
		return error("Paramètre plate manquant");
	}
	const car = cars[plate];
	if (!car) {
		return error(`Aucun véhicule connu pour la plaque ${plate}`, 404);
	}
	return success({ plate, ...car });
};

export default withLog(withCors(withAuth(GET)));
