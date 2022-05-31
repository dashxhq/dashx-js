// This function does not support nested objects
// eslint-disable-next-line import/prefer-default-export
export function parseFilterObject(filterObject: Record<string, any> = {}) {
  const filterBy: Record<string, any> = {}

  Object.keys(filterObject).forEach((key) => {
    if (key.startsWith('_')) {
      filterBy[key.substring(1)] = filterObject[key]
      return
    }

    filterBy.data = {
      [key]: filterObject[key],
      ...filterBy.data
    }
  })

  return filterBy
}

export function urlBase64ToUint8Array(base64String: string) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}