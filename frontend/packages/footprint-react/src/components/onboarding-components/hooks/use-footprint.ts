import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import { useContext, useState } from 'react';

import { type Di } from '../../../@types';
import { Context } from '../provider';
import saveReq from '../queries/save';
import { lockBody, unlockBody } from '../utils/dom-utils';

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
      userData: {
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
        setContext(prev => ({ ...prev, authToken }));
        onAuthenticated?.();
      },
    });

    fp.render();
    setContext(prev => ({ ...prev, fpInstance: fp }));
  };

  const save = async (
    data: Di,
    {
      onSuccess,
      onError,
    }: {
      onSuccess?: () => void;
      onError?: (error: unknown) => void;
    } = {},
  ) => {
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
      await saveReq({ data, bootstrapDis: [], authToken });
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
      throw new Error('No fpInstance found');
    }
    lockBody();
    context.fpInstance.relayFromComponents?.();
    setContext(prev => ({ ...prev, handoffCallbacks: { onComplete, onError, onCancel, onClose } }));
  };

  return { context, busy, handoff, launchIdentify, save };
};

export default useFootprint;
