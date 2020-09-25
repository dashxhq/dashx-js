// This function does not support nested objects
// eslint-disable-next-line import/prefer-default-export
export function snakeCaseKeys(obj: Record<string, any>): Record<string, any> {
  const toSnakeCase = (str: string): string => str.replace(
    /(.)([A-Z]+)/g,
    (m, previous, uppers) => `${previous}_${uppers.toLowerCase()}`
  )

  return Object.keys(obj).reduce(
    (accumulator, current) => ({ [toSnakeCase(current)]: obj[current], ...accumulator }), {}
  )
}
