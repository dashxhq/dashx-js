export const trackEventRequest = `
  mutation TrackEvent($input: TrackEventInput!) {
    trackEvent(input: $input) {
        id
    }
  }
`

export const identifyAccountRequest = `
  mutation IdentifyAccount($input: IdentifyAccountInput!) {
    identifyAccount(input: $input) {
        id
    }
  }
`

export const addContentRequest = `
  mutation AddContent($input: AddContentInput!) {
    addContent(input: $input) {
        id
        identifier
        position
        data
    }
  }
`

export const editContentRequest = `
  mutation EditContent($input: EditContentInput!) {
    editContent(input: $input) {
        id
        identifier
        position
        data
    }
  }
`

export const searchContentRequest = `
  query SearchContent($input: SearchContentInput!) {
    searchContent(input: $input)
  }
`

export const fetchContentRequest = `
  query FetchContentRequest($input: FetchContentInput!) {
    fetchContent(input: $input)
  }
`

export const createDeliveryRequest = `
  mutation CreateDelivery($input: CreateDeliveryInput!) {
    createDelivery(input: $input) {
        id
    }
  }
`

export const fetchItemRequest = `
  query FetchItem($input: FetchItemInput) {
    fetchItem(input: $input) {
        id
        installationId
        name
        identifier
        description
        createdAt
        updatedAt

        pricings {
            id
            amount
            originalAmount
            isRecurring
            recurringInterval
            recurringIntervalUnit
            currencyCode
            createdAt
            updatedAt
        }
    }
  }
`
