/**
 * Standardized error codes for API responses.
 *
 * Every error response carries a machine-readable `code` drawn from this enum
 * so clients can branch on the nature of the failure without parsing the
 * human-oriented `message`.
 */
export enum ErrorCode {
	/** The request is malformed or a required parameter is missing. */
	BAD_REQUEST = "BAD_REQUEST",
	/** The caller is not allowed to access the resource. */
	UNAUTHORIZED = "UNAUTHORIZED",
	/** The requested resource does not exist. */
	NOT_FOUND = "NOT_FOUND",
	/** An unexpected server-side failure occurred. */
	INTERNAL_ERROR = "INTERNAL_ERROR"
}
