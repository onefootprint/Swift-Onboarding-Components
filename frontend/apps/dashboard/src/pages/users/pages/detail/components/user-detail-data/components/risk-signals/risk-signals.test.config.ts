import { mockRequest } from '@onefootprint/test-utils';

export const riskSignalsFixture = {
  data: [
    {
      id: '1',
      severity: 'high',
      scope: 'identity',
      note: 'SSN tied to multiple names',
      noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
    },
    {
      id: '2',
      severity: 'high',
      scope: 'Address',
      note: 'Warm Address Alert',
      noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
    },
    {
      id: '3',
      severity: 'medium',
      scope: 'Email address',
      note: 'High Risk Email Domain',
      noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
    },
    {
      id: '4',
      severity: 'medium',
      scope: 'Phone number',
      note: 'VoIP Number',
      noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
    },
    {
      id: '5',
      severity: 'low',
      scope: 'Identity',
      note: 'IP Location Not Available',
      noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
    },
    {
      id: '6',
      severity: 'low',
      scope: 'Address',
      note: 'Street Name Does Not Match',
      noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
    },
    {
      id: '7',
      severity: 'low',
      scope: 'Address',
      note: 'Zip Code Does Not Match',
      noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
    },
  ],
  meta: {
    next: null,
    count: 7,
  },
};

// TODO: Integrate real api
// https://linear.app/footprint/issue/FP-1518/integrate-real-api
export const withRiskSignals = () =>
  mockRequest({
    method: 'get',
    fullPath: true,
    path: 'https://demo7616817.mockable.io/risk-signals',
    response: riskSignalsFixture,
  });

export const withRiskSignalsError = () =>
  mockRequest({
    method: 'get',
    fullPath: true,
    path: 'https://demo7616817.mockable.io/risk-signals',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
