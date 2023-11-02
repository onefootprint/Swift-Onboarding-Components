import { mockRequest } from '@onefootprint/test-utils';
import type { AmlDetail, RiskSignal } from '@onefootprint/types';
import { RiskSignalAttribute, RiskSignalSeverity } from '@onefootprint/types';

export const entityIdFixture = 'fp_id_yCZehsWNeywHnk5JqL20u';

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
  id: 'sig_qaJe8ZAxXAfgVORoShZY5F',
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

export const withRiskSignalAmlHits = (aml: AmlDetail = amlDetailFixture) =>
  mockRequest({
    method: 'post',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/decrypt_aml_hits/sig_qaJe8ZAxXAfgVORoShZY5F',
    response: aml,
  });
