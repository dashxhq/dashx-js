export const trackEventRequest = `
  mutation TrackEvent($input: TrackEventInput!) {
    trackEvent(input: $input) {
        id
    }
  }
`;

export const identifyAccountRequest = `
  mutation IdentifyAccount($input: IdentifyAccountInput!) {
    identifyAccount(input: $input) {
        id
    }
  }
`;

export const addContentRequest = `
  mutation AddContent($input: AddContentInput!) {
    addContent(input: $input) {
        id
        identifier
        position
        data
        createdAt
        updatedAt
    }
  }
`;

export const editContentRequest = `
  mutation EditContent($input: EditContentInput!) {
    editContent(input: $input) {
        id
        identifier
        position
        data
        createdAt
        updatedAt
    }
  }
`;

export const searchContentRequest = `
  query SearchContent($input: SearchContentInput!) {
    searchContent(input: $input) {
      contents {
          id
          identifier
          position
          data
          createdAt
          updatedAt
      }
    }
  }
`;

export const findContentRequest = `
  query FindContent($input: FindContentInput!) {
    findContent(input: $input) {
        id
        identifier
        position
        data
        createdAt
        updatedAt
    }
  }
`;

