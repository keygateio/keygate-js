/**
 * Generated by orval v6.10.3 🍺
 * Do not edit manually.
 */

export type LoginProcessStep =
	typeof LoginProcessStep[keyof typeof LoginProcessStep];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const LoginProcessStep = {
	RequirePassword: "RequirePassword",
	Require2fa: "Require2fa",
	RequireEmailConfirmation: "RequireEmailConfirmation",
	RequireEmailVerification: "RequireEmailVerification",
} as const;
