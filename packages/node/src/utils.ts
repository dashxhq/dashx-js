// This function does not support nested objects
// eslint-disable-next-line import/prefer-default-export
export function snakeCaseKeys<T>(obj: Record<string, T>): Record<string, T> {
  const toSnakeCase = (str: string): string => str.replace(
    /(.)([A-Z]+)/g,
    (m, previous, uppers) => `${previous}_${uppers.toLowerCase()}`
  )

  return Object.keys(obj).reduce(
    (accumulator, current) => ({ [toSnakeCase(current)]: obj[current], ...accumulator }), {}
  )
}
