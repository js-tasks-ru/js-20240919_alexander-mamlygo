/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (typeof string !== 'string') {
    throw new Error('First argument must be a string');
  }
  if (!Number.isFinite(size)) { return string; }

  let counter = 0;

  return string.split('').reduce((acc, cur) => {
    if (acc.at(-1) !== cur) {
      counter = 0;
    }

    if (counter < size) {
      counter++;
      return acc + cur;
    }
    return acc;
  }, '');
}
