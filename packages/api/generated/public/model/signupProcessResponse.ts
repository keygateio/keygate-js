/**
 * Generated by orval v6.10.3 🍺
 * Do not edit manually.
 */
import type { SignupProcessStep } from "./signupProcessStep";

export interface SignupProcessResponse {
	access_token?: string;
	expires_at: number;
	next_step: SignupProcessStep;
	process_id: string;
}
