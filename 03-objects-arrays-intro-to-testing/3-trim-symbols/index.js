/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (!Number.isFinite(size)) { return string; }

  let counter = 0;
  let currentChar = '';
  let result = '';

  for (const char of string) {
    if (currentChar !== char) {
      currentChar = char;
      counter = 0;
    }

    if (counter < size) {
      counter++;
      result += char;
    }
  }

  return result;
}
