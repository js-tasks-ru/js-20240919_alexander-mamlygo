/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const pathElements = path.split('.');

  return function (obj) {
    let result = obj;

    for (let pathElement of pathElements) {
      if (typeof result !== 'object' || result === null || !result.hasOwnProperty(pathElement)) {
        return undefined;
      }
      result = result[pathElement];
    }

    return result;
  };
}
