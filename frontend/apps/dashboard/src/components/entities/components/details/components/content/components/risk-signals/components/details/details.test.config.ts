import { mockRequest } from '@onefootprint/test-utils';
import type { AmlDetail, Entity, RiskSignal } from '@onefootprint/types';
import {
  EntityKind,
  EntityStatus,
  IdDI,
  RiskSignalAttribute,
  RiskSignalSeverity,
} from '@onefootprint/types';

export const entityIdFixture = 'fp_id_yCZehsWNeywHnk5JqL20u';

const attributesFixture = [
  IdDI.email,
  IdDI.firstName,
  IdDI.lastName,
  IdDI.country,
  IdDI.addressLine1,
  IdDI.dob,
  IdDI.state,
  IdDI.city,
  IdDI.zip,
];

export const entityFixture: Entity = {
  id: entityIdFixture,
  isPortable: true,
  kind: EntityKind.person,
  requiresManualReview: false,
  status: EntityStatus.pass,
  attributes: attributesFixture,
  data: attributesFixture.map(di => {
    if (di === IdDI.lastName) {
      return {
        identifier: IdDI.lastName,
        is_decryptable: true,
        source: 'hosted',
        transforms: { prefix_1: 'S' },
        value: null,
      };
    }
    if (di === IdDI.firstName) {
      return {
        identifier: IdDI.firstName,
        is_decryptable: true,
        source: 'hosted',
        transforms: {},
        value: 'John',
      };
    }
    return {
      identifier: di,
      is_decryptable: true,
      source: 'hosted',
      transforms: {},
      value: null,
    };
  }),
  decryptableAttributes: attributesFixture,
  startTimestamp: '2023-03-29T23:07:44.435194Z',
  lastActivityAt: '2023-10-08T22:43:11.928846Z',
  insightEvent: {
    timestamp: '2023-03-29T23:07:46.850237Z',
    ipAddress: '73.222.157.30',
    city: 'San Francisco',
    country: 'United States',
    region: 'CA',
    regionName: 'California',
    latitude: 37.7595,
    longitude: -122.4367,
    metroCode: '807',
    postalCode: '94114',
    timeZone: 'America/Los_Angeles',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
  },
  decryptedAttributes: {
    // [BusinessDI.name]: 'Acme Inc.',
  },
  watchlistCheck: null,
  hasOutstandingWorkflowRequest: false,
};

export const riskSignalDetailsFixture: RiskSignal = {
  id: 'sig_ryxauTlDX8hIm3wVRmm',
  onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
  reasonCode: 'phone_number_located_is_voip',
  note: 'VOIP phone number',
  description:
    "The consumer's phone number could be tied to an answering service, page, or VoIP.",
  severity: RiskSignalSeverity.Low,
  scopes: [RiskSignalAttribute.phoneNumber, RiskSignalAttribute.dob],
  timestamp: '2022-10-24T21:56:12.682238Z',
  hasAmlHits: false,
};

export const riskSignalDetailsWithAmlFixture: RiskSignal = {
  id: 'sig_ryxauTlDX8hIm3wVRmm',
  onboardingDecisionId: '',
  note: 'Adverse media hit',
  description: 'A strong potential match with adverse media found',
  reasonCode: 'adverse_media_hit',
  severity: RiskSignalSeverity.High,
  scopes: [RiskSignalAttribute.name, RiskSignalAttribute.dob],
  timestamp: '2023-10-08T22:43:11.795618Z',
  hasAmlHits: true,
};

export const amlDetailFixture: AmlDetail = {
  shareUrl: 'https://shareurl.com',
  hits: [
    {
      fields: {
        activationDate: '14/04/2022',
        address: 'New York City',
        chamber: 'Relations Chamber',
        countries: 'United Kingdom, United States',
        country: 'United States',
        eyeColor: 'Brown',
        gender: 'male',
        locationurl: 'https://locationurl.com',
      },
      matchTypes: ['name_exact'],
      media: [
        {
          date: '11/12/2023',
          pdfUrl: null,
          snippet: 'Sample snippet 1',
          title: 'Sample title 1',
          url: 'https://mediaurl.com',
        },
        {
          date: null,
          pdfUrl: null,
          snippet: 'Sample snippet 2',
          title: 'Sample title 2',
          url: '',
        },
      ],
      name: 'John Smith',
    },
  ],
};

export const withRiskSignalDetails = (
  riskSignal: RiskSignal = riskSignalDetailsFixture,
) =>
  mockRequest({
    method: 'get',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/risk_signals/sig_ryxauTlDX8hIm3wVRmm',
    response: riskSignal,
  });

export const withRiskSignalDetailsError = () =>
  mockRequest({
    method: 'get',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/risk_signals/sig_ryxauTlDX8hIm3wVRmm',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export const withDecryptRiskSignalAmlHits = (
  aml: AmlDetail = amlDetailFixture,
) =>
  mockRequest({
    method: 'post',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/decrypt_aml_hits/sig_ryxauTlDX8hIm3wVRmm',
    response: aml,
  });

export const withEntity = (entity = entityFixture) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entity.id}`,
    response: {
      ...entity,
    },
  });
