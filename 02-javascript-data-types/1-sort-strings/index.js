/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const locales = ['ru', 'en'];
  const compareFuncAsc = (a, b) => {
    return a.localeCompare(b, locales, {
      caseFirst: 'upper',
    });
  };

  const compareFuncDesc = (a, b) => {
    return b.localeCompare(a, locales, {
      caseFirst: 'upper',
    });
  };

  const arrCopy = arr.slice();

  if (param === 'asc') {
    return arrCopy.sort(compareFuncAsc);
  } else if (param === 'desc') {
    return arrCopy.sort(compareFuncDesc);
  }
}
