import { mockRequest } from '@onefootprint/test-utils';
import type { AmlDetail, Entity, RiskSignal } from '@onefootprint/types';
import { DataKind, EntityKind, EntityStatus, IdDI, RiskSignalAttribute, RiskSignalSeverity } from '@onefootprint/types';

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

const defaultAttribute = {
  isDecryptable: true,
  source: 'hosted',
  transforms: {},
  dataKind: DataKind.vaultData,
  value: null,
};

export const entityFixture: Entity = {
  id: entityIdFixture,
  isIdentifiable: true,
  kind: EntityKind.person,
  requiresManualReview: false,
  status: EntityStatus.pass,
  attributes: [],
  data: attributesFixture.map(di => {
    if (di === IdDI.lastName) {
      return {
        ...defaultAttribute,
        identifier: IdDI.lastName,
        transforms: { prefix_1: 'S' },
      };
    }
    if (di === IdDI.firstName) {
      return {
        ...defaultAttribute,
        identifier: IdDI.firstName,
        value: 'John',
      };
    }
    return {
      ...defaultAttribute,
      identifier: di,
    };
  }),
  decryptableAttributes: [],
  startTimestamp: '2023-03-29T23:07:44.435194Z',
  lastActivityAt: '2023-10-08T22:43:11.928846Z',
  workflows: [
    {
      createdAt: '2023-03-27T14:43:47.444716Z',
      playbookId: 'ob_config_id_3o5SdynZVGO1icDm8Z6llC',
      insightEvent: {
        timestamp: '2023-04-03T17:42:30.799202Z',
        ipAddress: '67.243.21.56',
        city: 'New York',
        country: 'United States',
        region: 'NY',
        regionName: 'New York',
        latitude: 40.7365,
        longitude: -74.0055,
        metroCode: '501',
        postalCode: '10014',
        timeZone: 'America/New_York',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Safari/605.1.15',
      },
    },
  ],
  decryptedAttributes: {},
  watchlistCheck: null,
  hasOutstandingWorkflowRequest: false,
  label: null,
};

export const riskSignalDetailsFixture: RiskSignal = {
  id: 'sig_ryxauTlDX8hIm3wVRmm',
  onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
  reasonCode: 'phone_number_located_is_voip',
  note: 'VOIP phone number',
  description: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
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

export const withRiskSignalDetails = (riskSignal: RiskSignal = riskSignalDetailsFixture) =>
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
      message: 'Something went wrong',
    },
  });

export const withDecryptRiskSignalAmlHits = (aml: AmlDetail = amlDetailFixture) =>
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

export const withData = (entity = entityFixture, response = {}) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entity.id}/data`,
    response,
  });
