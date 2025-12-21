import Decimal from 'decimal.js';
import { AMOUNT_PRECISION_SERVER } from '../precision/precision';

// Units to main currency
export function unitsToMC(units: number | null) {
  if (!units) return units;

  return new Decimal(units)
    .dividedBy(new Decimal(10).pow(AMOUNT_PRECISION_SERVER))
    .toNumber();
}

// Main currency to units
export function mcToUnits(mc: number) {
  return new Decimal(mc)
    .mul(new Decimal(10).pow(AMOUNT_PRECISION_SERVER))
    .floor()
    .toNumber();
}
