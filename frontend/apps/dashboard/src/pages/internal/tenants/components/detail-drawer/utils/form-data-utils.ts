/**
 * @param a The newly proposed value
 * @param b The existing value (or undefined if unset)
 * @returns The newly proposed value, `a`, if it's value differs from the existing value, `b`
 */
export const ifChanged = <T>(a: T, b: T | undefined) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    const isArrayEq = a.length === b.length && a.every(x => b.includes(x));
    return !isArrayEq ? a : undefined;
  }
  const aEqB = a === b;
  // We consider a null form value and undefined existing value to be equal
  const nullEq = a === null && b === undefined;
  const falseEq = a === false && b === undefined;
  return !aEqB && !nullEq && !falseEq ? a : undefined;
};

/**
 * Return null if v is either empty string or undefined, else returns v
 */
export const strOrNull = (v: string | undefined | null) => v || null;
