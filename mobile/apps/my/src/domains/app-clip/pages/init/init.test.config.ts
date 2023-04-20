import { mockRequest } from '@onefootprint/test-utils';
import * as Linking from 'expo-linking';

export const mockUrl = (url: string) => {
  jest.spyOn(Linking, 'useURL').mockImplementationOnce(() => url);
};

export const withD2pStatus = () =>
  mockRequest({
    method: 'post',
    path: 'https://api.dev.onefootprint.com/hosted/onboarding/d2p/status',
    response: {},
  });
