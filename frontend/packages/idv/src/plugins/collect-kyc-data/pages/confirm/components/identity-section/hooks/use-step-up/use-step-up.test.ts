import { customRenderHook, waitFor } from '@onefootprint/test-utils';
import { ChallengeKind, UserTokenScope } from '@onefootprint/types';

import useStepUp from './use-step-up';
import {
  mockGetBiometricChallengeResponse,
  withIdentify,
  withIdentifyError,
  withIdentifyVerify,
  withLoginChallenge,
  withLoginChallengeError,
  withUserToken,
  withUserTokenError,
} from './use-step-up.test.config';

jest.mock('./utils/get-biometric-challenge-response', () => ({
  __esModule: true,
  ...jest.requireActual('./utils/get-biometric-challenge-response'),
}));

describe.skip('useStepUp', () => {
  it('when needs and can step up, successfully promotes the auth token', async () => {
    withUserToken([]);
    withIdentify([ChallengeKind.biometric], true);
    withLoginChallenge(ChallengeKind.biometric);
    withIdentifyVerify();
    mockGetBiometricChallengeResponse();

    const device = {
      type: 'mobile',
      hasSupportForWebauthn: true,
      osName: 'iOS',
      browser: 'Mobile Safari',
    };
    const authToken = 'token';
    const onSuccess = jest.fn();
    const onError = jest.fn();

    const { result } = customRenderHook(() => useStepUp({ device, authToken, onSuccess, onError }));

    await waitFor(() => {
      expect(result.current.needsStepUp).toBe(true);
    });
    await waitFor(() => {
      expect(result.current.canStepUp).toBe(true);
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.stepUp();

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('new-token');
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('when there are api errors', () => {
    it('when user token api call errors, should call onError', async () => {
      withUserTokenError();
      withIdentify();

      const device = {
        type: 'mobile',
        hasSupportForWebauthn: true,
        osName: 'iOS',
        browser: 'Mobile Safari',
      };
      const authToken = 'token';
      const onSuccess = jest.fn();
      const onError = jest.fn();

      customRenderHook(() => useStepUp({ device, authToken, onSuccess, onError }));

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });

    it('when identify api call errors, should call onError', async () => {
      withUserToken([UserTokenScope.sensitiveProfile]);
      withIdentifyError();

      const device = {
        type: 'mobile',
        hasSupportForWebauthn: true,
        osName: 'iOS',
        browser: 'Mobile Safari',
      };
      const authToken = 'token';
      const onSuccess = jest.fn();
      const onError = jest.fn();

      customRenderHook(() => useStepUp({ device, authToken, onSuccess, onError }));

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });

    it('when login challenge api call errors, should call onError', async () => {
      withUserToken([UserTokenScope.sensitiveProfile]);
      withIdentify([ChallengeKind.biometric], true);
      withLoginChallengeError();

      const device = {
        type: 'mobile',
        hasSupportForWebauthn: true,
        osName: 'iOS',
        browser: 'Mobile Safari',
      };
      const authToken = 'token';
      const onSuccess = jest.fn();
      const onError = jest.fn();

      const { result } = customRenderHook(() => useStepUp({ device, authToken, onSuccess, onError }));

      const { stepUp } = result.current;
      await stepUp();

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });

    it('when login challenge returns non-biometric challenge, should call onError', async () => {
      withUserToken([UserTokenScope.sensitiveProfile]);
      withIdentify([ChallengeKind.biometric], true);
      withLoginChallenge(ChallengeKind.biometric);

      const device = {
        type: 'mobile',
        hasSupportForWebauthn: true,
        osName: 'iOS',
        browser: 'Mobile Safari',
      };
      const authToken = 'token';
      const onSuccess = jest.fn();
      const onError = jest.fn();

      const { result } = customRenderHook(() => useStepUp({ device, authToken, onSuccess, onError }));

      const { stepUp } = result.current;
      await stepUp();

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });
  });

  describe('when there are canStepUp and needsStepUp failures', () => {
    it('when mobile device supports webauthn, canStepUp should be true', async () => {
      withUserToken([UserTokenScope.sensitiveProfile]);
      withIdentify([ChallengeKind.biometric], true);

      const device = {
        type: 'mobile',
        hasSupportForWebauthn: true,
        osName: 'iOS',
        browser: 'Mobile Safari',
      };
      const authToken = 'token';
      const onSuccess = jest.fn();
      const onError = jest.fn();

      const { result } = customRenderHook(() => useStepUp({ device, authToken, onSuccess, onError }));

      await waitFor(() => {
        expect(result.current.canStepUp).toBe(true);
      });
    });

    it('when desktop device supports webauthn and has syncable pass keys, canStepUp should be true', async () => {
      withUserToken([UserTokenScope.sensitiveProfile]);
      withIdentify([ChallengeKind.biometric], true);

      const device = {
        type: 'desktop',
        hasSupportForWebauthn: true,
        osName: 'iOS',
        browser: 'Mobile Safari',
      };
      const authToken = 'token';
      const onSuccess = jest.fn();
      const onError = jest.fn();

      const { result } = customRenderHook(() => useStepUp({ device, authToken, onSuccess, onError }));

      await waitFor(() => {
        expect(result.current.canStepUp).toBe(true);
      });
    });

    it('when desktop device supports webauthn but does not have syncable pass keys, canStepUp should be false', async () => {
      withUserToken([]);
      withIdentify([ChallengeKind.biometric], false);

      const device = {
        type: 'desktop',
        hasSupportForWebauthn: true,
        osName: 'iOS',
        browser: 'Mobile Safari',
      };
      const authToken = 'token';
      const onSuccess = jest.fn();
      const onError = jest.fn();

      const { result } = customRenderHook(() => useStepUp({ device, authToken, onSuccess, onError }));

      await waitFor(() => {
        expect(result.current.canStepUp).toBe(false);
      });

      const { stepUp } = result.current;
      await stepUp();
      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });

    it('when device does not support webauthn, canStepUp should be false', async () => {
      withUserToken([UserTokenScope.sensitiveProfile]);
      withIdentify([ChallengeKind.biometric], true);

      const device = {
        type: 'desktop',
        hasSupportForWebauthn: false,
        osName: 'iOS',
        browser: 'Mobile Safari',
      };
      const authToken = 'token';
      const onSuccess = jest.fn();
      const onError = jest.fn();

      const { result } = customRenderHook(() => useStepUp({ device, authToken, onSuccess, onError }));

      await waitFor(() => {
        expect(result.current.canStepUp).toBe(false);
      });

      const { stepUp } = result.current;
      await stepUp();
      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });

    it('when biometric is not one of available challenge kinds, canStepUp should be false', async () => {
      withUserToken([]);
      withIdentify([], true);

      const device = {
        type: 'mobile',
        hasSupportForWebauthn: true,
        osName: 'iOS',
        browser: 'Mobile Safari',
      };
      const authToken = 'token';
      const onSuccess = jest.fn();
      const onError = jest.fn();

      const { result } = customRenderHook(() => useStepUp({ device, authToken, onSuccess, onError }));

      await waitFor(() => {
        expect(result.current.canStepUp).toBe(false);
      });

      const { stepUp } = result.current;
      await stepUp();
      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });

    it('when user token does include sensitive profile permissions, needsStepUp is false', async () => {
      withUserToken([UserTokenScope.sensitiveProfile]);
      withIdentify([ChallengeKind.biometric], true);

      const device = {
        type: 'mobile',
        hasSupportForWebauthn: true,
        osName: 'iOS',
        browser: 'Mobile Safari',
      };
      const authToken = 'token';
      const onSuccess = jest.fn();
      const onError = jest.fn();

      const { result } = customRenderHook(() => useStepUp({ device, authToken, onSuccess, onError }));

      await waitFor(() => {
        expect(result.current.needsStepUp).toBe(false);
      });

      const { stepUp } = result.current;
      await stepUp();
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(authToken);
      });
    });
  });
});
