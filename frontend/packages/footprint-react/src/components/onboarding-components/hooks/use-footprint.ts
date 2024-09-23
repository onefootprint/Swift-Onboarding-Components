import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import { useContext } from 'react';

import type { FormValues } from '../../../types';
import { InlineProcessError } from '../../../types/request';
import { Context } from '../components/provider';
import { getValidationToken } from '../queries/challenge';
import decryptUserVaultReq from '../queries/decrypt-user-vault';
import getRequirementsReq from '../queries/get-requirements';
import processReq from '../queries/process';
import vaultReq from '../queries/vault';
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
    await vaultReq({
      data: formatBeforeSave(formValues, context.locale ?? 'en-US'),
      bootstrapDis: [],
      authToken: vaultingToken,
    });
  };

  const decryptUserData = (fields: keyof FormValues) => {
    if (!context.verifiedAuthToken) {
      throw new Error('No authToken found. Please authenticate first');
    }
    return decryptUserVaultReq({ authToken: context.verifiedAuthToken, fields });
  };

  const getRequirements = () => {
    if (!context.verifiedAuthToken) {
      throw new Error('No authToken found. Please authenticate first');
    }
    return getRequirementsReq({ authToken: context.verifiedAuthToken });
  };

  const process = async () => {
    if (!context.verifiedAuthToken) {
      throw new Error('No authToken found. Please authenticate first');
    }
    try {
      await processReq({ token: context.verifiedAuthToken });
    } catch (error: unknown) {
      throw new InlineProcessError((error as Error).message || 'Something happened');
    }
    const [requirements, { validationToken }] = await Promise.all([
      getRequirementsReq({ authToken: context.verifiedAuthToken }),
      getValidationToken({ authToken: context.verifiedAuthToken }),
    ]);

    return { validationToken, requirements };
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
    footprint
      .init({
        authToken,
        appearance: context.appearance,
        sandboxOutcome: context.sandboxOutcome,
        kind: FootprintComponentKind.Components,
        onComplete,
        onError,
        onCancel,
        onClose,
      })
      .render();
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
    decryptUserData,
    getRequirements,
    handoff,
    process,
    vault,
    ...otp,
    data: {
      onboardingConfig: context.onboardingConfig,
      challengeData: context.challengeData,
    },
  };
};

export default useFootprint;
