import { mockRequest } from '@onefootprint/test-utils';

export const riskSignalDetailsFixture = {
  id: '1',
  severity: 'high',
  scope: 'identity',
  note: 'SSN tied to multiple names',
  noteDetails: 'The submitted street name does not match the located data.',
  dataVendor: 'Ideology',
  relatedSignals: [
    {
      id: '1001',
      severity: 'high',
      scope: 'Address',
      note: 'Warm Address Alert Lorem',
      noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
    },
    {
      id: '1002',
      severity: 'medium',
      scope: 'Email address',
      note: 'High Risk Email Domain',
      noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
    },
  ],
  rawResponse: '{ \n "idNumber":4287950518 \n}',
};

// TODO: Integrate real api
// https://linear.app/footprint/issue/FP-1518/integrate-real-api
export const withRiskSignalDetails = () =>
  mockRequest({
    method: 'get',
    fullPath: true,
    path: 'http://demo7616817.mockable.io/risk-signals-details',
    response: riskSignalDetailsFixture,
  });

export const withRiskSignalDetailsError = () =>
  mockRequest({
    method: 'get',
    fullPath: true,
    path: 'http://demo7616817.mockable.io/risk-signals-details',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
