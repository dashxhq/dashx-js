export function parseFilterObject(filterObject) {
  const filterBy = {}

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

export function toContentList(contentList) {
  return contentList.map(JSON.parse)
}

export function toContentSingleton(contentList) {
  return Array.isArray(contentList) ? JSON.parse(data[0]) : null
}
