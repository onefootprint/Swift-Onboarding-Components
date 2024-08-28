import { useContext, useState } from 'react';

import type { FormValues } from '../../../types';
import { Context } from '../provider';
import saveReq from '../queries/save';
import { lockBody } from '../utils/dom-utils';
import { formatBeforeSave } from '../utils/save-utils';

export const useFootprint = () => {
  const [context, setContext] = useContext(Context);
  const [busy, setBusy] = useState<string | null>(null);

  const save = async (
    data: FormValues,
    {
      onSuccess,
      onError,
    }: {
      onSuccess?: () => void;
      onError?: (error: unknown) => void;
    } = {},
  ) => {
    const { vaultingToken, onboardingConfig } = context;
    if (!vaultingToken) {
      onError?.(new Error('No authToken found. Please authenticate first'));
      return;
    }

    if (!onboardingConfig) {
      onError?.(new Error('No onboardingConfig found. Make sure that the publicKey is correct'));
      return;
    }

    if (onboardingConfig.kind !== 'kyc' && onboardingConfig.kind !== 'kyb') {
      onError?.(new Error('Onboarding components only support kyc and kyb kind'));
      return;
    }

    try {
      setBusy('save');
      await saveReq({
        data: formatBeforeSave(data, context.locale ?? 'en-US'),
        bootstrapDis: [],
        authToken: vaultingToken,
      });
      onSuccess?.();
    } catch (error: unknown) {
      onError?.(error);
    } finally {
      setBusy(null);
    }
  };

  const handoff = ({
    onComplete,
    onError,
    onCancel,
    onClose,
  }: {
    onComplete?: (validationToken: string) => void;
    onError?: (error: unknown) => void;
    onCancel?: () => void;
    onClose?: () => void;
  } = {}) => {
    if (!context.fpInstance) {
      onError?.(new Error('No fpInstance found'));
      return;
    }
    lockBody();
    context.fpInstance.relayFromComponents?.();
    setContext(prev => ({ ...prev, handoffCallbacks: { onComplete, onError, onCancel, onClose } }));
  };

  return { context, busy, handoff, save };
};

export default useFootprint;
