import type { ComponentsSdkProps } from '@onefootprint/footprint-js/src/types/components';
import { useContext } from 'react';

import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import type { FormValues } from '../../../types';
import { Context } from '../components/provider';
import save from '../queries/save';
import { lockBody } from '../utils/dom-utils';
import { formatBeforeSave } from '../utils/save-utils';
import useOtp from './use-otp';

export const useFootprint = () => {
  const [context, setContext] = useContext(Context);
  const otp = useOtp();

  const vault = async (formValues: FormValues) => {
    const { vaultingToken, onboardingConfig } = context;
    if (!vaultingToken) {
      throw new Error('No authToken found. Please authenticate first');
    }
    if (!onboardingConfig) {
      throw new Error('No onboardingConfig found. Make sure that the publicKey is correct');
    }
    if (onboardingConfig.kind !== 'kyc' && onboardingConfig.kind !== 'kyb') {
      throw new Error('Onboarding components only support kyc and kyb kind');
    }
    await save({
      data: formatBeforeSave(formValues, context.locale ?? 'en-US'),
      bootstrapDis: [],
      authToken: vaultingToken,
    });
  };

  const createNewHandoff = ({
    onComplete,
    onError,
    onCancel,
    onClose,
    authToken,
  }: {
    onComplete?: (validationToken: string) => void;
    onError?: (error: unknown) => void;
    onCancel?: () => void;
    onClose?: () => void;
    authToken: string;
  }) => {
    const props: ComponentsSdkProps = {
      authToken,
      appearance: context.appearance,
      sandboxOutcome: context.sandboxOutcome,
      kind: FootprintComponentKind.Components,
      onComplete,
      onError,
      onCancel,
      onClose,
    };

    const fp = footprint.init(props);
    fp.render();
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
    // We may not have the fpInstance if the user is authenticated through inline OTP
    // In that case, we will have the vaultingToken and authToken
    // We can use the authToken to create a new fpInstance
    // If we don't have any of these, we can't proceed
    if (!context.fpInstance) {
      if (!context.vaultingToken || !context.verifiedAuthToken) {
        onError?.(new Error('No fpInstance found'));
        return;
      }
      createNewHandoff({ onComplete, onError, onCancel, onClose, authToken: context.verifiedAuthToken });
    } else {
      lockBody();
      context.fpInstance.relayFromComponents?.();
      setContext(prev => ({ ...prev, handoffCallbacks: { onComplete, onError, onCancel, onClose } }));
    }
  };

  return {
    handoff,
    save: vault,
    ...otp,
  };
};

export default useFootprint;
