/**
 * Standardized response helpers for API functions.
 *
 * Every API response follows the same format:
 * { status, success, error, code, message, payload }
 *
 * - `success(payload, status)` → success: true, payload: data
 * - `error(code, message, status)` → success: false, code + message
 */
import { ErrorCode } from "./errors";

/** Base URL used to resolve relative request URLs (see `requestUrl`). */
const BASE_URL = process.env.BASE_URL ?? "";

/**
 * Interprets an environment variable as a boolean flag.
 *
 * @param name the name of the environment variable
 * @returns true when the variable holds "1", "true", "yes" or "on" (case-insensitive), false otherwise
 */
export const envFlag = (name: string): boolean => /^(1|true|yes|on)$/i.test((process.env[name] ?? "").trim());

/**
 * Builds a standardized success response.
 *
 * @param payload the data to return
 * @param status the HTTP status code (default 200)
 * @returns a JSON response in the standard format
 */
export const success = (payload: unknown, status = 200): Response =>
	Response.json({ status, success: true, error: null, payload }, { status });

/**
 * Builds a standardized error response.
 *
 * @param code the machine-readable error code
 * @param message the human-readable error message
 * @param status the HTTP status code (default 400)
 * @returns a JSON response in the standard format
 */
export const error = (code: ErrorCode, message: string, status = 400): Response =>
	Response.json({ status, success: false, error: code, message, payload: null }, { status });

/**
 * Resolves a request URL into an absolute URL.
 *
 * Some runtimes (e.g. Vercel Serverless) pass a relative `request.url`
 * (e.g. `/api/car-model?plate=ED-512-BL`). `new URL()` requires an
 * absolute URL, so the relative path is resolved against the `BASE_URL`
 * environment variable when it is set.
 *
 * @param request the incoming request
 * @returns the absolute URL of the request
 */
export const requestUrl = (request: Request): URL => {
	const raw = request.url;
	try {
		return new URL(raw);
	} catch {
		if (!BASE_URL) {
			throw new Error(
				"request.url est relatif et BASE_URL n'est pas définie : impossible de construire l'URL."
			);
		}
		return new URL(raw, BASE_URL);
	}
};

/**
 * Converts any thrown error into a standardized error response.
 *
 * Every API handler should be wrapped so that unexpected errors are returned
 * as HTTP responses instead of crashing the function. The response uses the
 * standard `error()` format with a 500 status.
 *
 * @param err the thrown value
 * @param fallback a message used when the thrown value is not an Error
 * @returns a JSON error response
 */
export const errorFromException = (err: unknown, fallback = "Erreur interne du serveur"): Response =>
	error(ErrorCode.INTERNAL_ERROR, err instanceof Error ? err.message : fallback, 500);

/**
 * Shortens a text to a maximum length, appending an ellipsis when truncated.
 *
 * @param text the text to shorten
 * @param maxLength the maximum length of the result, ellipsis included (default 100)
 * @returns the original text when short enough, otherwise a truncated copy
 */
export const truncate = (text: string, maxLength = 100): string =>
	text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}…`;

/** Body content types whose parameters are extracted by `requestParams`. */
const LOGGABLE_BODY_TYPES = new Set([
	"application/json",
	"application/x-www-form-urlencoded",
	"multipart/form-data"
]);

/**
 * Extracts the parameters of a request for logging purposes.
 *
 * Query and body parameters are merged into a single record. The body is read
 * from a clone of the request so the original stream stays available for the
 * handler. Only JSON and form bodies are parsed; other content types, or a
 * malformed body, contribute no parameters. This helper never throws.
 *
 * @param request the incoming request
 * @returns the merged query and body parameters, empty when none
 */
export const requestParams = async (request: Request): Promise<Record<string, unknown>> => {
	const params: Record<string, unknown> = {};
	for (const [key, value] of requestUrl(request).searchParams) {
		params[key] ??= value;
	}

	const contentType = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
	if (!LOGGABLE_BODY_TYPES.has(contentType) || request.bodyUsed) {
		return params;
	}

	try {
		const clone = request.clone();
		if (contentType === "application/json") {
			Object.assign(params, await clone.json());
		} else {
			const formData = await clone.formData();
			formData.forEach((value, key) => {
				params[key] ??= value instanceof File ? `[file ${value.name}]` : value;
			});
		}
	} catch {
		return params;
	}
	return params;
};
