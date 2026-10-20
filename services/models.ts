/**
 * Known vehicle records keyed by license plate.
 *
 * Exported as a plain TypeScript object instead of a `.json` file so the
 * module has no JSON-import dependency at runtime.
 */
export type ModelDetails = { brand: string; model: string; year: number };

/** Vehicle records keyed by license plate (uppercase, no spaces). */
export const models: Record<string, ModelDetails> = {
	"AB-123-CD": { brand: "Volkswagen", model: "Golf", year: 2018 },
	"AZ-456-EF": { brand: "Renault", model: "Clio", year: 2019 },
	"BT-789-GH": { brand: "Peugeot", model: "208", year: 2021 },
	"CC-012-IJ": { brand: "BMW", model: "Série 3", year: 2020 },
	"DG-345-KL": { brand: "Citroën", model: "C3", year: 2022 },
	"ED-512-BL": { brand: "Citroën", model: "C4 Cactus", year: 2006 },
	"EH-678-MN": { brand: "Dacia", model: "Sandero", year: 2020 },
	"FJ-901-OP": { brand: "Toyota", model: "Yaris", year: 2021 },
	"GK-234-QR": { brand: "Ford", model: "Focus", year: 2017 }
};
