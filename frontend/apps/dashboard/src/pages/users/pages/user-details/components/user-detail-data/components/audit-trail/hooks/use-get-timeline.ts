import { RequestError } from '@onefootprint/request';
import { Timeline } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSessionUser from 'src/hooks/use-session-user';

// TODO: uncomment implementation below when API supports all necessary fields
// https://linear.app/footprint/issue/FP-1815/replace-the-mock-timeline-data-with-the-api-call-when-all-necessary

// type TimelineRequestQueryString = {
//   footprintUserId: string;
// };

// type TimelineRequestQueryKey = [
//   string,
//   TimelineRequestQueryString,
//   AuthHeaders,
// ];

// const getTimelineRequest = async ({
//   queryKey,
// }: QueryFunctionContext<QueryKey, string>) => {
//   const [, params, authHeaders] = queryKey as TimelineRequestQueryKey;
//   const response = await request<Timeline>({
//     method: 'GET',
//     url: `/users/${params.footprintUserId}/timeline`,
//     headers: authHeaders,
//   });
//   return response.data;
// };

const getTimelineRequest = () =>
  [
    {
      event: {
        kind: 'data_collected',
        data: {
          attributes: ['full_address', 'ssn4', 'email'],
        },
      },
      timestamp: '2022-11-03T20:12:44.112480Z',
    },
    {
      event: {
        kind: 'biometric_registered',
        data: {
          kind: 'webauthn',
          insightEvent: {
            ipAddress: '10.0.0.1',
          },
          webauthnCredential: {
            attestations: ['iPhone 16'],
            location: 'San Francisco, CA',
            os: 'iOS',
            device: 'iPhone',
          },
        },
      },
      timestamp: '2022-11-03T20:13:09.375074Z',
    },
    {
      event: {
        kind: 'onboarding_decision',
        data: {
          id: 'decision_x6TwpiBAmXC4OlRpsqsXi4',
          verificationStatus: 'needs_id_document',
          complianceStatus: 'not_applicable',
          timestamp: '2022-11-03T20:13:09.425700Z',
          source: {
            kind: 'footprint',
            vendors: ['idology', 'experian'],
          },
          mustCollectData: ['full_address', 'ssn4', 'email'],
          collectedIdDocuments: [],
        },
      },
      timestamp: '2022-11-03T20:13:09.429980Z',
    },
    {
      event: {
        kind: 'document_uploaded',
        data: {
          idDocKind: 'id_card',
        },
      },
      timestamp: '2022-11-03T20:13:09.375074Z',
    },
    {
      event: {
        kind: 'onboarding_decision',
        data: {
          id: 'decision_NVsco1Z3ELH475edJuafzB',
          verificationStatus: 'verified',
          complianceStatus: 'no_flags_found',
          timestamp: '2022-11-03T20:13:09.359410Z',
          source: {
            kind: 'footprint',
            vendors: ['socure', 'idology', 'experian'],
          },
          mustCollectData: ['full_address', 'ssn4', 'email'],
          collectedIdDocuments: ['id_card'],
        },
      },
      timestamp: '2022-11-03T20:13:09.375074Z',
    },
    {
      event: {
        kind: 'onboarding_decision',
        data: {
          id: 'decision_NVsco1Z3ELH475edJuafzB',
          verificationStatus: 'failed',
          complianceStatus: 'no_flags_found',
          timestamp: '2022-11-03T20:13:09.359410Z',
          source: {
            kind: 'organization',
            member: {
              email: 'john@company.com',
            },
            reason: 'Identity theft or fraudulent',
            note: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            notePinned: true,
          },
          mustCollectData: [],
          collectedIdDocuments: [],
        },
      },
      timestamp: '2022-11-03T20:13:09.375074Z',
    },
  ] as Timeline;

const useGetTimeline = (footprintUserId: string) => {
  const { authHeaders } = useSessionUser();
  const filters = {
    footprintUserId,
  };

  return useQuery<Timeline, RequestError>(
    ['timeline', filters, authHeaders],
    getTimelineRequest,
    {
      retry: false,
    },
  );
};

export default useGetTimeline;
