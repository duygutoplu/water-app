const ML_IN_OUNCE = 29.5735;

export function mlToOz(ml: number): number {
  return ml / ML_IN_OUNCE;
}

export function ozToMl(oz: number): number {
  return oz * ML_IN_OUNCE;
}

