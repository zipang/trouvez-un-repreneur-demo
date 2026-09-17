/**
 * Composable middlewares for API functions.
 *
 * Each middleware takes a handler `(request) => Response` and returns a new one,
 * adding a behavior layer. Middlewares are combined with `compose`:
 * `compose(withCors, withAuth)(GET)`.
 */
import { ErrorCode } from "./errors";
import { envFlag, error, errorFromException, requestParams, requestUrl, truncate } from "./helpers";

/** Signature of an API handler. */
export type RequestHandler = (request: Request) => Response | Promise<Response>;

/** Signature of a middleware: takes a handler, returns a wrapped handler. */
export type Middleware = (handler: RequestHandler) => RequestHandler;

/** Maximum length of the parameters segment logged by `withLog`. */
const LOG_PARAMS_MAX_LENGTH = 100;

/**
 * Composes middlewares from the outermost to the innermost layer.
 *
 * `compose(withCors, withAuth)(GET)` is equivalent to `withCors(withAuth(GET))`.
 *
 * @param middlewares the middlewares to combine, outermost first
 * @returns a single middleware applying all layers
 */
export const compose =
	(...middlewares: Middleware[]): Middleware =>
	(handler) =>
		middlewares.reduceRight((wrapped, middleware) => middleware(wrapped), handler);

/** Hostname of the base URL, used to detect same-origin requests. */
const BASE_URL_HOSTNAME = new URL(process.env.BASE_URL ?? "http://localhost").hostname;

/**
 * Accepted external origins mapped to their API key.
 *
 * Parsed at module load from the `API_CLIENTS` environment variable, a JSON
 * object: { "https://client-a.com": "KEY_A", ... }. Invalid entries are
 * skipped so a single malformed pair never breaks the whole map.
 */
const API_CLIENTS: Record<string, string> = (() => {
	try {
		const raw = JSON.parse(process.env.API_CLIENTS ?? "{}") as Record<string, unknown>;
		return Object.fromEntries(Object.entries(raw).filter(([, key]) => typeof key === "string")) as Record<
			string,
			string
		>;
	} catch {
		return {};
	}
})();

/**
 * Resolves the origin hostname of a request.
 *
 * @param request the incoming request
 * @returns the hostname of the `Origin` header, or null when the header is absent
 */
const originHostname = (request: Request): string | null => {
	const origin = request.headers.get("origin");
	if (!origin) {
		return null;
	}
	try {
		return new URL(origin).hostname;
	} catch {
		return null;
	}
};

/**
 * Computes the CORS headers for a request.
 *
 * An origin is reflected when it is a known external client or shares the
 * hostname of `BASE_URL`. Unknown origins get the safe `"null"` value.
 *
 * @param request the incoming request
 * @returns the CORS headers to apply
 */
const corsHeaders = (request: Request): Record<string, string> => {
	const origin = request.headers.get("origin");
	const allowed =
		origin && (API_CLIENTS[origin] !== undefined || originHostname(request) === BASE_URL_HOSTNAME)
			? origin
			: "null";
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
export const withCors: Middleware = (handler) => async (request) => {
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
 * Both the `Origin` and `x-api-key` headers are mandatory. Requests from the
 * same domain as `BASE_URL` are allowed without an API key. External requests
 * must present an `Origin` that matches a known client and an `x-api-key`
 * equal to that client's key.
 *
 * @param handler the handler to wrap
 * @returns the wrapped handler
 */
export const withAuth: Middleware = (handler) => async (request) => {
	const origin = request.headers.get("origin");
	if (!origin) {
		return error(ErrorCode.UNAUTHORIZED, "En-tête Origin manquant", 401);
	}

	if (originHostname(request) === BASE_URL_HOSTNAME) {
		return handler(request);
	}

	const key = request.headers.get("x-api-key");
	if (!key || key !== API_CLIENTS[origin]) {
		return error(ErrorCode.UNAUTHORIZED, "Non autorisé", 401);
	}
	return handler(request);
};

/**
 * Adds a logging layer to a handler.
 *
 * Logs each incoming request and its response on a single line, including
 * the HTTP method, path, status code, and the time taken to handle it.
 *
 * When `MIDDLEWARE_LOG_PARAMETERS` is enabled, the query and body parameters
 * (see `requestParams`) are appended as a JSON object truncated to
 * `LOG_PARAMS_MAX_LENGTH` characters.
 *
 * @param handler the handler to wrap
 * @returns the wrapped handler
 */
export const withLog: Middleware = (handler) => async (request) => {
	const startedAt = performance.now();
	const url = requestUrl(request);
	const suffix = envFlag("MIDDLEWARE_LOG_PARAMETERS")
		? ` params=${truncate(JSON.stringify(await requestParams(request)), LOG_PARAMS_MAX_LENGTH)}`
		: "";
	try {
		const response = await handler(request);
		const elapsed = (performance.now() - startedAt).toFixed(1);
		console.log(`[api] ${request.method} ${url.pathname} -> ${response.status} (${elapsed}ms)${suffix}`);
		return response;
	} catch (error) {
		const elapsed = (performance.now() - startedAt).toFixed(1);
		console.error(`[api] ${request.method} ${url.pathname} -> ERROR (${elapsed}ms)${suffix}`);
		throw error;
	}
};

/**
 * Adds an error-handling layer to a handler.
 *
 * Catches any error thrown by the inner handlers and returns it as a
 * standardized error response instead of letting the function crash. This
 * guarantees that a thrown error never surfaces as a hard
 * `FUNCTION_INVOCATION_FAILED`. Wrap it as close to the handler as possible
 * while keeping `withCors` outside so error responses still get CORS headers.
 *
 * @param handler the handler to wrap
 * @returns the wrapped handler
 */
export const withErrors: Middleware = (handler) => async (request) => {
	try {
		return await handler(request);
	} catch (err) {
		return errorFromException(err);
	}
};
