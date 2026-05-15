/**
 * Calculate the user charge for a request.
 * All monetary values are in USD.
 *
 * @param tokensInput Number of input tokens
 * @param tokensOutput Number of output tokens
 * @param pricingInput Provider pricing per 1M input tokens
 * @param pricingOutput Provider pricing per 1M output tokens
 * @returns Total charge in USD
 *
 * Note: In production, consider using a decimal library (e.g., decimal.js)
 * to avoid floating-point rounding errors on financial calculations.
 */
export function calculateCharge(
  tokensInput: number,
  tokensOutput: number,
  pricingInput: number,
  pricingOutput: number
): number {
  const inputCost = (tokensInput / 1_000_000) * pricingInput;
  const outputCost = (tokensOutput / 1_000_000) * pricingOutput;
  return inputCost + outputCost;
}

export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  pricingInput: number,
  pricingOutput: number
): number {
  return calculateCharge(inputTokens, outputTokens, pricingInput, pricingOutput);
}
