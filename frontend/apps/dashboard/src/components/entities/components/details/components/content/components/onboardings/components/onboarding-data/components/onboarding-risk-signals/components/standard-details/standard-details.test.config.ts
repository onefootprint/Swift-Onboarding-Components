import { getAmlDetail, getEntity, getRiskSignalDetail } from '@onefootprint/fixtures/dashboard';
import type { AmlDetail, Entity, RiskSignalDetail } from '@onefootprint/request-types/dashboard';
import { mockRequest } from '@onefootprint/test-utils';

export const entityIdFixture = 'fp_id_yCZehsWNeywHnk5JqL20u';

export const entityFixture: Entity = getEntity({
  id: entityIdFixture,
  data: [
    {
      isDecryptable: true,
      source: 'hosted',
      transforms: {},
      dataKind: 'vault_data',
      value: undefined,
      identifier: 'id.first_name',
    },
    {
      isDecryptable: true,
      source: 'hosted',
      transforms: {},
      dataKind: 'vault_data',
      value: undefined,
      identifier: 'id.last_name',
    },
    {
      isDecryptable: true,
      source: 'hosted',
      transforms: {},
      dataKind: 'vault_data',
      value: undefined,
      identifier: 'id.dob',
    },
  ],
});

export const riskSignalDetailFixture: RiskSignalDetail = getRiskSignalDetail({
  id: 'sig_ryxauTlDX8hIm3wVRmm',
  onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
  reasonCode: 'phone_number_located_is_voip',
  note: 'VOIP phone number',
  description: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
  severity: 'low',
  scopes: ['phone_number', 'dob'],
  timestamp: '2022-10-24T21:56:12.682238Z',
  hasAmlHits: false,
});

export const riskSignalDetailWithAmlFixture: RiskSignalDetail = getRiskSignalDetail({
  id: 'sig_ryxauTlDX8hIm3wVRmm',
  onboardingDecisionId: '',
  note: 'Adverse media hit',
  description: 'A strong potential match with adverse media found',
  reasonCode: 'adverse_media_hit',
  severity: 'high',
  scopes: ['name', 'dob'],
  timestamp: '2023-10-08T22:43:11.795618Z',
  hasAmlHits: true,
});

export const amlDetailFixture: AmlDetail = getAmlDetail({
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
          pdfUrl: '',
          snippet: 'Sample snippet 1',
          title: 'Sample title 1',
          url: 'https://mediaurl.com',
        },
        {
          date: '',
          pdfUrl: '',
          snippet: 'Sample snippet 2',
          title: 'Sample title 2',
          url: '',
        },
      ],
      name: 'John Smith',
    },
  ],
});

export const withRiskSignalDetails = (riskSignal: RiskSignalDetail = riskSignalDetailFixture) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entityIdFixture}/risk_signals/${riskSignal.id}`,
    response: riskSignal,
  });

export const withRiskSignalDetailsError = (riskSignal: RiskSignalDetail = riskSignalDetailFixture) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entityIdFixture}/risk_signals/${riskSignal.id}`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

export const withDecryptRiskSignalAmlHits = (aml: AmlDetail = amlDetailFixture) =>
  mockRequest({
    method: 'post',
    path: `/entities/${entityIdFixture}/decrypt_aml_hits/${riskSignalDetailWithAmlFixture.id}`,
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
