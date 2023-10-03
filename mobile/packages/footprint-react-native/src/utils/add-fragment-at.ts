/**
 * This function adds a string at the desired position in another string, expecting the pattern POS1__POS2__POS3
 * @param {Number} pos 1, 2, or 3
 * @param {String} url The current URL
 * @param {String} value The encoded value to be added in the URL
 * @returns {String}
 * @examples
 *  - addFragmentAt(3, '', 'VALUE') == X__X__VALUE
 *  - addFragmentAt(0, 'POS1', 'VALUE') == VALUE
 *  - addFragmentAt(3, 'POS1', 'VALUE') == POS1__X__VALUE
 *  - addFragmentAt(3, 'POS1__POS2', 'VALUE') == POS1__POS2__VALUE
 *  - addFragmentAt(2, '', 'VALUE') == X__VALUE
 *  - addFragmentAt(2, 'POS1', 'VALUE') == POS1__VALUE
 *  - addFragmentAt(2, 'POS1__POS2__POS3', 'VALUE') == POS1__VALUE__POS3
 *  - addFragmentAt(3, 'POS1__POS2__POS3', 'VALUE') == POS1__POS2__VALUE
 */
const addFragmentAt = (pos: 1 | 2 | 3, url: string, value: string): string => {
  if (pos <= 1) return value;
  const posList = url.split('__');
  const doubleDashCount = posList.length - 1;

  if (posList.length >= pos) {
    posList[pos - 1] = value;
    return posList.join('__');
  }

  let str = '';
  let count = pos - doubleDashCount;
  while (count > 1) {
    str = count - 1 === 1 ? str.concat(`__${value}`) : str.concat('__X');
    count -= 1;
  }

  return (url || 'X') + str;
};

export default addFragmentAt;
