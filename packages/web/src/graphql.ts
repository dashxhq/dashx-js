import gql from 'nanographql';

export const trackEventRequest = gql`
  mutation TrackEvent($input: TrackEventInput!) {
    trackEvent(input: $input) {
        id
    }
  }
`;

export const identifyAccountRequest = gql`
  mutation IdentifyAccount($input: IdentifyAccountInput!) {
    identifyAccount(input: $input) {
        id
    }
  }
`;

export const addContentRequest = gql`
  mutation AddContent($input: AddContentInput!) {
    addContent(input: $input) {
        id
    }
  }
`;

export const editContentRequest = gql`
  mutation EditContent($input: EditContentInput!) {
    editContent(input: $input) {
        id
    }
  }
`;

export const searchContentRequest = gql`
  query SearchContent($input: SearchContentInput!) {
    searchContent(input: $input) {
      contents {
          id
          position
          data
      }
    }
  }
`;

export const findContentRequest = gql`
  query FindContent($input: FindContentInput!) {
    findContent(input: $input) {
        id
        position
        data
    }
  }
`;

