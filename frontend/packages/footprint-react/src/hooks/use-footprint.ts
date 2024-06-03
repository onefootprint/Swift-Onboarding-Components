import type { FootprintUserData } from '@onefootprint/footprint-js';
import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import { useContext, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { ApiError, type UserDataError } from '../@types';
import { Context } from '../components/onboarding-components/provider';
import saveReq from '../queries/save';
import { lockBody, unlockBody } from '../utils/dom-utils';
import getVaultData from '../utils/get-vault-data';

export const useFootprint = () => {
  const [context, setContext] = useContext(Context);
  const form = useFormContext<FootprintUserData>();
  const [busy, setBusy] = useState<string | null>(null);
  const callbacks: {
    onError?: (error: unknown) => void;
    onComplete?: (validationToken: string) => void;
    onCancel?: () => void;
    onClose?: () => void;
  } = {};

  const getVaultFormData = () => {
    const values = form.getValues();
    return getVaultData(values);
  };

  const launchIdentify = ({
    email,
    phoneNumber,
    onAuthenticated,
    onCancel,
    onError,
    onComplete,
    onClose,
  }: {
    email?: string;
    phoneNumber?: string;
    onAuthenticated?: () => void;
    onError?: (error: unknown) => void;
    onCancel?: () => void;
    onComplete?: (validationToken: string) => void;
    onClose?: () => void;
  } = {}) => {
    const fp = footprint.init({
      appearance: context.appearance,
      publicKey: context.publicKey,
      userData: {
        'id.phone_number': phoneNumber || form.getValues('id.phone_number'),
        'id.email': email || form.getValues('id.email'),
      },
      kind: FootprintComponentKind.Components,
      onComplete: callbacks.onComplete || onComplete,
      onError: callbacks.onError || onError,
      onCancel: callbacks.onCancel || onCancel,
      onClose: callbacks.onClose || onClose,
      onRelayToComponents: (authToken: string) => {
        unlockBody();
        setContext(prev => ({ ...prev, authToken }));
        onAuthenticated?.();
      },
    });
    fp.render();
    setContext({ ...context, fpInstance: fp });
  };

  const handleError = (error: unknown) => {
    if (error instanceof ApiError) {
      const apiError = error as ApiError<UserDataError>;
      Object.entries(apiError.details.message).forEach(([key, value]) => {
        if (typeof value === 'string') {
          form.setError(key as keyof FootprintUserData, { message: value });
        }
      });
    }
  };

  const save = async ({
    onSuccess,
    onError,
  }: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  } = {}) => {
    const { authToken, onboardingConfig } = context;
    if (!authToken) {
      throw new Error('No authToken found');
    }
    if (!onboardingConfig) {
      throw new Error('No onboardingConfig found');
    }
    if (onboardingConfig.kind !== 'kyc' && onboardingConfig.kind !== 'kyb') {
      throw new Error('Onboarding components only support kyc and kyb kind');
    }
    try {
      setBusy('save');
      const data = getVaultFormData();
      await saveReq({ data, bootstrapDis: [], authToken }, onboardingConfig);
      onSuccess?.();
    } catch (error: unknown) {
      onError?.(error);
      handleError(error);
    } finally {
      setBusy(null);
    }
  };

  const handoff = ({
    onCancel,
    onError,
    onComplete,
    onClose,
  }: {
    onError?: (error: unknown) => void;
    onCancel?: () => void;
    onComplete?: (validationToken: string) => void;
    onClose?: () => void;
  } = {}) => {
    if (!context.fpInstance) {
      throw new Error('No fpInstance found');
    }
    callbacks.onCancel = onCancel;
    callbacks.onError = onError;
    callbacks.onComplete = onComplete;
    callbacks.onClose = onClose;

    lockBody();
    context.fpInstance.relayFromComponents?.();
  };

  const methods = {
    handoff,
    launchIdentify,
    save,
  };

  return { form, context, busy, ...methods };
};

export default useFootprint;
