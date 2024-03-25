/**
 * Checks if an element or any of its parent elements has the role 'option' within a certain limit of parent elements.
 * @param {any} x - The element to check or its parent element.
 * @param {number} [limit=5] - The maximum number of parent elements to traverse.
 * @returns {boolean} Returns true if the element or any of its parent elements has the role 'option' within the specified limit, otherwise returns false.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasOptionRole = (x: any, limit: number = 5): boolean => {
  if (!x || !limit) return false;
  if (x?.role === 'option') return true;
  return hasOptionRole(x?.parentElement, limit - 1);
};

export default hasOptionRole;
