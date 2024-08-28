import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import { useContext, useState } from 'react';

import type { FormValues } from '../../../types';
import { Context } from '../provider';
import saveReq from '../queries/save';
import { lockBody, unlockBody } from '../utils/dom-utils';
import { formatBeforeSave } from '../utils/save-utils';

export const useFootprint = () => {
  const [context, setContext] = useContext(Context);
  const [busy, setBusy] = useState<string | null>(null);

  const launchIdentify = (
    { email, phoneNumber }: { email?: string; phoneNumber?: string },
    {
      onAuthenticated,
      onError,
    }: {
      onAuthenticated?: () => void;
      onError?: (error: unknown) => void;
    } = {},
  ) => {
    const fp = footprint.init({
      appearance: context.appearance,
      publicKey: context.publicKey,
      sandboxOutcome: context.sandboxOutcome,
      bootstrapData: {
        'id.phone_number': phoneNumber,
        'id.email': email,
      },
      kind: FootprintComponentKind.Components,
      onComplete: (validationToken: string) => {
        setContext(prev => {
          prev.handoffCallbacks?.onComplete?.(validationToken);
          return prev;
        });
      },
      onError: (error: unknown) => {
        onError?.(error);
        setContext(prev => {
          prev.handoffCallbacks?.onError?.(error);
          return prev;
        });
      },
      onCancel: () => {
        setContext(prev => {
          prev.handoffCallbacks?.onCancel?.();
          return prev;
        });
      },
      onClose: () => {
        setContext(prev => {
          prev.handoffCallbacks?.onClose?.();
          return prev;
        });
      },
      onRelayToComponents: (authToken: string) => {
        unlockBody();
        // This part might be a little confusing, but we need to set the vaultingToken here
        // Technically, the the authToken we recieve here has a lower scope and can only be used for vaulting
        // The token is created by a API request to "/hosted/user/tokens" using the original authToken
        setContext(prev => ({ ...prev, vaultingToken: authToken }));
        onAuthenticated?.();
      },
    });

    fp.render();
    setContext(prev => ({ ...prev, fpInstance: fp }));
  };

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

  return { context, busy, handoff, launchIdentify, save };
};

export default useFootprint;
