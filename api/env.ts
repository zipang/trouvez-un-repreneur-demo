/**
 * Environment variable validation for API functions.
 *
 * Every API function declares the environment variables it expects through a
 * schema object. `checkEnv()` validates that the required ones are present
 * and throws a descriptive error naming any missing variable, so a
 * misconfiguration surfaces with the exact variable to set.
 */

/** Describes one expected environment variable. */
export type EnvVarSpec = {
	/** Whether the variable must be set for the function to work. */
	required?: boolean;
	/** When the variable is optional, the value used when it is absent. */
	default?: string;
	/** Human-readable role of the variable, used in error messages. */
	description?: string;
};

/** Schema of expected environment variables: name → specification. */
export type EnvSchema = Record<string, EnvVarSpec>;

/**
 * Validates the environment against a schema and throws if a required
 * variable is missing.
 *
 * The thrown error lists every missing required variable (with its optional
 * description), so a misconfigured deployment reports the exact name to set.
 *
 * @param schema the expected environment variables
 * @throws {Error} when one or more required variables are not set
 */
export const checkEnv = (schema: EnvSchema): void => {
	const missing = Object.entries(schema)
		.filter(([name, spec]) => spec.required && !(process.env[name] ?? "").trim())
		.map(([name, spec]) => (spec.description ? `${name} (${spec.description})` : name));

	if (missing.length > 0) {
		throw new Error(`Variables d'environnement manquantes : ${missing.join(", ")}.`);
	}
};
