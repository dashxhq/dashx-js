import type { Parcel } from './Client'

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

export const createParcel = (
  { to = [], cc = [], bcc = [], data = {}, channel } : Parcel
) => ({
  to: Array.isArray(to) ? to : [ to ],
  cc,
  bcc,
  data,
  channel: channel?.toUpperCase()
})
