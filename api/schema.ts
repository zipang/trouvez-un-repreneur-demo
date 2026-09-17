/**
 * Shared environment variable schema for the API functions.
 *
 * Declares every environment variable the API expects, so `checkEnv()` can
 * validate the configuration of a deployment and report the exact missing
 * variable names.
 */
import type { EnvSchema } from "./env";

/** Environment variables expected by the API. */
export const apiEnv: EnvSchema = {
	BASE_URL: {
		required: true,
		description:
			"URL de base publique pour résoudre les URLs relatives et détecter les requêtes same-origin"
	},
	API_CLIENTS: {
		required: false,
		description: "JSON des origines externes autorisées associées à leur clé d'API"
	},
	MIDDLEWARE_LOG_PARAMETERS: {
		required: false,
		default: "FALSE",
		description: "Journalise les paramètres des requêtes (URL + body) dans les logs de withLog"
	}
};
