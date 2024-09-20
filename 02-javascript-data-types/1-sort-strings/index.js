/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const locales = ['ru', 'en'];
  const sortedAsc = arr.toSorted((a, b) => {
    return a.localeCompare(b, locales, {
      caseFirst: 'upper',
    });
  });

  switch (param) {
  case 'asc':
    return sortedAsc;
  case 'desc':
    return sortedAsc.reverse();
  default:
    throw new Error(`Order should be 'asc' or 'desc', received ${param}`);
  }
}
