import { customRenderHook, waitFor } from '@onefootprint/test-utils';
import { ChallengeKind } from '@onefootprint/types';
import MockDate from 'mockdate';
import { BootstrapData } from 'src/hooks/use-bifrost-machine';

import useProcessBootstrapData from './use-legacy-process-bootstrap-data';
import {
  withIdentify,
  withIdentifySmsChallengeNotAvailable,
  withIdentifyUserNotFound,
  withLoginChallenge,
} from './use-legacy-process-bootstrap-data.test.config';

const testDate = new Date('2020-01-01');

describe('useProcessBootstrapData hook', () => {
  beforeAll(() => {
    MockDate.set(testDate);
  });

  afterAll(() => {
    MockDate.reset();
  });

  const renderUseProcessBootstrapData = (bootstrapData: BootstrapData) => {
    const onSuccess = jest.fn();
    const onError = jest.fn();

    customRenderHook(() =>
      useProcessBootstrapData({
        options: { onSuccess, onError },
        bootstrapData,
      }),
    );
    return { onSuccess, onError };
  };

  describe('when bootstrap data is empty', () => {
    it('calls error callback', async () => {
      const { onSuccess, onError } = renderUseProcessBootstrapData({});

      expect(onError).toBeCalled();
      expect(onSuccess).not.toBeCalled();
    });
  });

  describe('when bootstrap data has email', () => {
    describe('when user found', () => {
      describe('when sms challenge available', () => {
        beforeEach(() => {
          withIdentify();
          withLoginChallenge();
        });

        it('calls success callback with sms challenge data', async () => {
          const { onSuccess, onError } = renderUseProcessBootstrapData({
            email: 'someone@gmail.com',
          });

          await waitFor(() => {
            expect(onSuccess).toBeCalledWith(true, {
              challengeToken: 'challengeToken',
              challengeKind: ChallengeKind.sms,
              retryDisabledUntil: testDate,
            });
          });
          expect(onError).not.toBeCalled();
        });
      });

      describe('when sms challenge not available', () => {
        beforeEach(() => {
          withIdentifySmsChallengeNotAvailable();
        });

        it('calls error callback', async () => {
          const { onSuccess, onError } = renderUseProcessBootstrapData({
            email: 'someone@gmail.com',
          });

          await waitFor(() => {
            expect(onError).toBeCalled();
          });
          expect(onSuccess).not.toBeCalled();
        });
      });
    });

    describe('when user not found', () => {
      beforeEach(() => {
        withIdentifyUserNotFound();
      });

      it('calls error callback', async () => {
        const { onSuccess, onError } = renderUseProcessBootstrapData({
          email: 'someone@gmail.com',
        });

        await waitFor(() => {
          expect(onError).toBeCalled();
        });

        expect(onSuccess).not.toBeCalled();
      });
    });
  });

  describe('when bootstrap data has phone', () => {
    describe('when user found', () => {
      describe('when sms challenge available', () => {
        beforeEach(() => {
          withIdentify();
          withLoginChallenge();
        });

        it('calls success callback with sms challenge data', async () => {
          const { onSuccess, onError } = renderUseProcessBootstrapData({
            phoneNumber: '+12342345234',
          });

          await waitFor(() => {
            expect(onSuccess).toBeCalledWith(true, {
              challengeToken: 'challengeToken',
              challengeKind: ChallengeKind.sms,
              retryDisabledUntil: testDate,
            });
          });

          expect(onError).not.toBeCalled();
        });
      });
    });

    describe('when user not found', () => {
      beforeEach(() => {
        withIdentifyUserNotFound();
      });

      it('calls onError', async () => {
        const { onSuccess, onError } = renderUseProcessBootstrapData({
          phoneNumber: '+12342345234',
        });

        await waitFor(() => {
          expect(onError).toBeCalled();
        });

        expect(onSuccess).not.toBeCalled();
      });
    });
  });

  describe('when bootstrap data has both email and phone number', () => {
    describe('when user not found', () => {
      beforeEach(() => {
        withIdentifyUserNotFound();
        withIdentifyUserNotFound();
      });

      it('falls back to the phone number', async () => {
        const { onSuccess, onError } = renderUseProcessBootstrapData({
          email: 'someone@gmail.com',
          phoneNumber: '+122432423423',
        });

        await waitFor(() => {
          expect(onError).toBeCalled();
        });

        expect(onSuccess).not.toBeCalled();
      });
    });
  });
});
