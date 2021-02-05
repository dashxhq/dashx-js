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

export const pushContentRequest = gql`
  mutation PushContent($input: PushContentInput!) {
    pushContent(input: $input) {
        id
    }
  }
`;
