/**
 * Composable middlewares for API functions.
 *
 * Each wrapper takes a handler `(request) => Response` and returns a new one,
 * adding a behavior layer. Composition is done by nesting: `withCors(withAuth(GET))`.
 */
import { error } from "./helpers";

/** Signature of an API handler. */
type Handler = (request: Request) => Response | Promise<Response>;

/** Allowed origins (comma-separated in CORS_ORIGINS). */
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS ?? "")
	.split(",")
	.map((o) => o.trim())
	.filter(Boolean);

/**
 * Computes the CORS headers for a request.
 *
 * @param request the incoming request
 * @returns the CORS headers to apply
 */
const corsHeaders = (request: Request): Record<string, string> => {
	const origin = request.headers.get("origin");
	const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : "null";
	return {
		"Access-Control-Allow-Origin": allowed,
		Vary: "Origin",
		"Access-Control-Allow-Methods": "GET",
		"Access-Control-Allow-Headers": "x-api-key, Content-Type",
		"Access-Control-Max-Age": "86400"
	};
};

/**
 * Adds a CORS layer to a handler.
 *
 * Answers OPTIONS preflight requests and adds CORS headers to responses.
 *
 * @param handler the handler to wrap
 * @returns the wrapped handler
 */
export const withCors =
	(handler: Handler): Handler =>
	async (request) => {
		if (request.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: corsHeaders(request) });
		}
		const response = await handler(request);
		for (const [key, value] of Object.entries(corsHeaders(request))) {
			response.headers.set(key, value);
		}
		return response;
	};

/**
 * Adds an authentication layer to a handler.
 *
 * Checks the `x-api-key` header against the `API_KEY` environment variable.
 *
 * @param handler the handler to wrap
 * @returns the wrapped handler
 */
export const withAuth =
	(handler: Handler): Handler =>
	async (request) => {
		const key = request.headers.get("x-api-key");
		if (!key || key !== process.env.API_KEY) {
			return error("Non autorisé", 401);
		}
		return handler(request);
	};

/**
 * Adds a logging layer to a handler.
 *
 * Logs each incoming request and its response on a single line, including
 * the HTTP method, path, status code, and the time taken to handle it.
 *
 * @param handler the handler to wrap
 * @returns the wrapped handler
 */
export const withLog =
	(handler: Handler): Handler =>
	async (request) => {
		const startedAt = performance.now();
		const url = new URL(request.url);
		try {
			const response = await handler(request);
			const elapsed = (performance.now() - startedAt).toFixed(1);
			console.log(`[api] ${request.method} ${url.pathname} -> ${response.status} (${elapsed}ms)`);
			return response;
		} catch (error) {
			const elapsed = (performance.now() - startedAt).toFixed(1);
			console.error(`[api] ${request.method} ${url.pathname} -> ERROR (${elapsed}ms)`);
			throw error;
		}
	};
