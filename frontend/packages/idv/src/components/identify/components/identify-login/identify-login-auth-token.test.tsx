import '../../../../config/initializers/i18next-test';

import { customRender, screen, waitFor } from '@onefootprint/test-utils';
import { CLIENT_PUBLIC_KEY_HEADER, ChallengeKind, UserTokenScope } from '@onefootprint/types';
import mockRouter from 'next-router-mock';

import { Layout } from '../../../layout';
import IdentifyLoginAuthToken from './identify-login-auth-token';
import {
  bootstrapExistingUserWithPasskey,
  mockGetBiometricChallengeResponse,
  sandboxOnboardingConfigFixture,
  withIdentify,
  withIdentifyError,
  withIdentifyVerify,
  withLoginChallenge,
} from './identify-login.test.config';
import { IdentifyVariant } from './state/types';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

jest.mock('../../../../utils/get-biometric-challenge-response', () => ({
  __esModule: true,
  ...jest.requireActual('../../../../utils/get-biometric-challenge-response'),
}));

const renderIdentify = ({
  onDone,
}: {
  onDone?: () => void;
}) => {
  return customRender(
    <Layout onClose={() => undefined}>
      <IdentifyLoginAuthToken
        initialArgs={{
          variant: IdentifyVariant.verify,
          config: sandboxOnboardingConfigFixture,
          isLive: false,
          isComponentsSdk: false,
          obConfigAuth: { [CLIENT_PUBLIC_KEY_HEADER]: 'pk' },
          email: undefined,
          phoneNumber: undefined,
          device: {
            type: 'mobile',
            hasSupportForWebauthn: true,
            osName: 'iOS',
            browser: 'Safari',
          },
          initialAuthToken: 'utok_xxx',
        }}
        onDone={onDone ?? (() => undefined)}
      />
    </Layout>,
  );
};

describe('<IdentifyLoginAuthToken />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/');
    // TODO: not sure why this is needed before all tests...
    withLoginChallenge(ChallengeKind.biometric);
  });

  describe('When sufficient scopes', () => {
    it('identify machine finishes without challenge', async () => {
      withIdentify({
        challengeKinds: [ChallengeKind.sms],
        tokenScopes: [UserTokenScope.signup],
      });
      const onDone = jest.fn();
      renderIdentify({ onDone });

      await waitFor(() => {
        expect(onDone).toHaveBeenCalled();
      });
    });
  });

  describe('When user not found', () => {
    it('takes user to invalid auth token page', async () => {
      withIdentifyError();
      renderIdentify({});

      await waitFor(() => {
        expect(screen.getByText('The link you opened is invalid')).toBeInTheDocument();
      });
    });
  });

  describe('When user found with insufficient scopes', () => {
    beforeEach(() => {
      withIdentify({});
      withLoginChallenge(ChallengeKind.biometric);
      withIdentifyVerify();
      mockGetBiometricChallengeResponse();
    });

    it('takes user to challenge', async () => {
      const onDone = jest.fn();
      renderIdentify({ onDone });

      await bootstrapExistingUserWithPasskey();
      await waitFor(() => {
        expect(onDone).toHaveBeenCalled();
      });
    });
  });
});
