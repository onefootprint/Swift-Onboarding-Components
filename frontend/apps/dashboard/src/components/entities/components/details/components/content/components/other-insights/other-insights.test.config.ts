import { mockRequest } from '@onefootprint/test-utils';
import type { UserInsights } from '@onefootprint/types';
import { UserInsightsUnit } from '@onefootprint/types';

const listResponseFixture: UserInsights[] = [
  {
    name: 'Fraud Ring Indicator',
    value: 'false',
    scope: 'behavior',
    description: 'This session has behavior associated to fraud ring activities',
    unit: UserInsightsUnit.Boolean,
  },
  {
    name: 'Automated Activity',
    value: 'false',
    scope: 'behavior',
    description: 'This session has automated behaviors',
    unit: UserInsightsUnit.Boolean,
  },
  {
    name: 'VPN',
    value: 'false',
    scope: 'device',
    description: 'The public IP of the user is associated with a VPN',
    unit: UserInsightsUnit.Boolean,
  },
  {
    name: 'Multiple Sessions per Device',
    value: 'false',
    scope: 'device',
    description: 'Browser in incognito mode',
    unit: UserInsightsUnit.Boolean,
  },
  {
    name: 'Incognito Mode',
    value: 'false',
    scope: 'device',
    description: 'Browser in incognito mode',
    unit: UserInsightsUnit.Boolean,
  },
  {
    name: 'Tor Exit Node',
    value: 'false',
    scope: 'device',
    description: 'Public IP associated with TOR exit node',
    unit: UserInsightsUnit.Boolean,
  },
  {
    name: 'Public Proxy',
    value: 'false',
    scope: 'device',
    description: 'Public IP associated with a proxy',
    unit: UserInsightsUnit.Boolean,
  },
  {
    name: 'Suspicious Device - Emulator',
    value: 'false',
    scope: 'device',
    description: '',
    unit: UserInsightsUnit.Boolean,
  },
  {
    name: 'Suspicious Device - Missing Expected Properties',
    value: 'false',
    scope: 'device',
    description: '',
    unit: UserInsightsUnit.Boolean,
  },
  {
    name: 'Suspicious Device - Frida',
    value: 'false',
    scope: 'device',
    description: '',
    unit: UserInsightsUnit.Boolean,
  },
  {
    name: 'Cookie ID',
    value: 'eae4796d-31a0-4f4a-82cf-667517ae2dcc',
    scope: 'device',
    description: 'Identifier based on browser cookie',
    unit: UserInsightsUnit.String,
  },
  {
    name: 'Device ID',
    value: 'haf4zVI8tGrsdrpUEFEi',
    scope: 'device',
    description: 'Persistent identifier based on fingerprinting',
    unit: UserInsightsUnit.String,
  },
  {
    name: 'Workflow time in ms',
    value: '309429',
    scope: 'workflow',
    description: 'The amount of time in ms it took this user to onboard',
    unit: UserInsightsUnit.TimeInMs,
  },
];

export const withOtherInsightsError = () =>
  mockRequest({
    method: 'get',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/user_insights',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export const withOtherInsightsEmpty = () =>
  mockRequest({
    method: 'get',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/user_insights',
    response: [],
  });

export const withOtherInsights = () =>
  mockRequest({
    method: 'get',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/user_insights',
    response: listResponseFixture,
  });
