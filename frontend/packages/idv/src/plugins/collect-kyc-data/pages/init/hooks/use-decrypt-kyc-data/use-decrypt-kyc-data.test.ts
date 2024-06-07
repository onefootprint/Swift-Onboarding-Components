import { customRenderHook, waitFor } from '@onefootprint/test-utils';
import { CollectedKycDataOption, IdDI, UserTokenScope } from '@onefootprint/types';

import useDecryptKycData from './use-decrypt-kyc-data';
import { withDecrypt, withDecryptError, withUserToken, withUserTokenError } from './use-decrypt-kyc-data.test.config';

describe.skip('useDecryptKycData', () => {
  it('when auth token scope includes only basic data, should decrypt only basic attributes', async () => {
    withUserToken([UserTokenScope.signup]);
    withDecrypt({
      [IdDI.firstName]: 'John',
      [IdDI.lastName]: 'Doe',
      [IdDI.email]: 'john@onefootprint.com',
    });
    const onSuccess = jest.fn();
    const onError = jest.fn();
    const authToken = 'token';
    const populatedCdos = [CollectedKycDataOption.email, CollectedKycDataOption.name, CollectedKycDataOption.ssn4];

    customRenderHook(() => useDecryptKycData({ authToken, populatedCdos, onSuccess, onError }));
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({
        [IdDI.ssn4]: {
          value: '',
          decrypted: false,
          scrubbed: true,
        },
        [IdDI.firstName]: {
          value: 'John',
          decrypted: true,
          scrubbed: false,
        },
        [IdDI.lastName]: {
          value: 'Doe',
          decrypted: true,
          scrubbed: false,
        },
        [IdDI.email]: {
          value: 'john@onefootprint.com',
          decrypted: true,
          scrubbed: false,
        },
      });
    });
  });

  it('when auth token scope includes sensitive data, should decrypt all populated attributes', async () => {
    withUserToken([UserTokenScope.signup, UserTokenScope.sensitiveProfile]);
    withDecrypt({
      [IdDI.firstName]: 'John',
      [IdDI.lastName]: 'Doe',
      [IdDI.email]: 'john@onefootprint.com',
      [IdDI.ssn4]: '1234',
    });
    const onSuccess = jest.fn();
    const onError = jest.fn();
    const authToken = 'token';
    const populatedCdos = [CollectedKycDataOption.email, CollectedKycDataOption.name, CollectedKycDataOption.ssn4];

    customRenderHook(() => useDecryptKycData({ authToken, populatedCdos, onSuccess, onError }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({
        [IdDI.ssn4]: {
          value: '1234',
          decrypted: true,
          scrubbed: false,
        },
        [IdDI.firstName]: {
          value: 'John',
          decrypted: true,
          scrubbed: false,
        },
        [IdDI.lastName]: {
          value: 'Doe',
          decrypted: true,
          scrubbed: false,
        },
        [IdDI.email]: {
          value: 'john@onefootprint.com',
          decrypted: true,
          scrubbed: false,
        },
      });
    });
  });

  it('when auth token scope does not include basic or sensitive data, scrubs all data fields', async () => {
    withUserToken([]);
    withDecrypt({});
    const onSuccess = jest.fn();
    const onError = jest.fn();
    const authToken = 'token';
    const populatedCdos = [CollectedKycDataOption.email, CollectedKycDataOption.name, CollectedKycDataOption.ssn4];

    customRenderHook(() => useDecryptKycData({ authToken, populatedCdos, onSuccess, onError }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({
        [IdDI.ssn4]: {
          value: '',
          decrypted: false,
          scrubbed: true,
        },
        [IdDI.firstName]: {
          value: '',
          decrypted: false,
          scrubbed: true,
        },
        [IdDI.lastName]: {
          value: '',
          decrypted: false,
          scrubbed: true,
        },
        [IdDI.email]: {
          value: '',
          decrypted: false,
          scrubbed: true,
        },
      });
    });
  });

  it('when api call to check token permissions fails, should call onError', async () => {
    withUserTokenError();
    const onSuccess = jest.fn();
    const onError = jest.fn();
    const authToken = 'token';
    const populatedCdos = [CollectedKycDataOption.email, CollectedKycDataOption.name, CollectedKycDataOption.ssn4];

    customRenderHook(() => useDecryptKycData({ authToken, populatedCdos, onSuccess, onError }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it('when api call to decrypt data fails, should call onError', async () => {
    withUserToken([UserTokenScope.signup, UserTokenScope.sensitiveProfile]);
    withDecryptError();
    const onSuccess = jest.fn();
    const onError = jest.fn();
    const authToken = 'token';
    const populatedCdos = [CollectedKycDataOption.email, CollectedKycDataOption.name, CollectedKycDataOption.ssn4];

    customRenderHook(() => useDecryptKycData({ authToken, populatedCdos, onSuccess, onError }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });
});
