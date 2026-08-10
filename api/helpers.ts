/**
 * Standardized response helpers for API functions.
 *
 * Every API response follows the same format:
 * { status, success, error, payload }
 *
 * - `success(payload, status)` → success: true, payload: data
 * - `error(message, status)`   → success: false, error: message
 */

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
 * @param message the error message
 * @param status the HTTP status code (default 400)
 * @returns a JSON response in the standard format
 */
export const error = (message: string, status = 400): Response =>
	Response.json({ status, success: false, error: message, payload: null }, { status });
