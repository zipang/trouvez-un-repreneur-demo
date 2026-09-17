import { checkEnv } from "../env";
import { ErrorCode } from "../errors";
import { error, requestUrl, success } from "../helpers";
import { compose, type RequestHandler, withAuth, withCors, withErrors, withLog } from "../middleware";
import { apiEnv } from "../schema";
// temporary mockup for a models lookup API
import { models } from "../../services/models";

const GET: RequestHandler = async (request) => {
	checkEnv(apiEnv);
	const { searchParams } = requestUrl(request);
	const plate = searchParams.get("plate")?.trim();
	if (!plate) {
		return error(ErrorCode.BAD_REQUEST, "Paramètre plate manquant");
	}
	const model = models[plate];
	if (!model) {
		return error(ErrorCode.NOT_FOUND, `Aucun véhicule connu pour la plaque ${plate}`, 404);
	}
	return success({ plate, ...model });
};

export default compose(withCors, withErrors, withLog, withAuth)(GET);
