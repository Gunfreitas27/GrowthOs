export interface IceInputs {
    iceImpact: number;     // 1–10
    iceConfidence: number; // 1–10
    iceEase: number;       // 1–10
}

export interface RiceInputs {
    riceReach: number;      // any positive number
    riceImpact: number;     // 1–3
    riceConfidence: number; // 0–100 (percent)
    riceEffort: number;     // weeks, > 0
}

export function calculateIceScore(inputs: IceInputs): number {
    return (inputs.iceImpact + inputs.iceConfidence + inputs.iceEase) / 3;
}

export function calculateRiceScore(inputs: RiceInputs): number {
    if (inputs.riceEffort <= 0) return 0;
    return (inputs.riceReach * inputs.riceImpact * (inputs.riceConfidence / 100)) / inputs.riceEffort;
}

export function calculatePriorityScore(
    ice: Partial<IceInputs>,
    rice: Partial<RiceInputs>,
): number | null {
    const riceComplete =
        rice.riceReach != null &&
        rice.riceImpact != null &&
        rice.riceConfidence != null &&
        rice.riceEffort != null;

    if (riceComplete) {
        return calculateRiceScore(rice as RiceInputs);
    }

    const iceComplete =
        ice.iceImpact != null &&
        ice.iceConfidence != null &&
        ice.iceEase != null;

    if (iceComplete) {
        return calculateIceScore(ice as IceInputs);
    }

    return null;
}

export type ScoreMethod = "RICE" | "ICE" | null;

export function getScoreMethod(
    ice: Partial<IceInputs>,
    rice: Partial<RiceInputs>,
): ScoreMethod {
    const riceComplete =
        rice.riceReach != null &&
        rice.riceImpact != null &&
        rice.riceConfidence != null &&
        rice.riceEffort != null;
    if (riceComplete) return "RICE";

    const iceComplete =
        ice.iceImpact != null &&
        ice.iceConfidence != null &&
        ice.iceEase != null;
    if (iceComplete) return "ICE";

    return null;
}
