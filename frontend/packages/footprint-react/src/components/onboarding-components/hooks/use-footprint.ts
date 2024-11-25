import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import { useContext } from 'react';

import { OnboardingRequirementKind } from '@onefootprint/types';
import type { FormValues } from '../../../types';
import { InlineProcessError } from '../../../types/request';
import { Context } from '../components/provider';
import getRequirementsReq from '../queries/get-onboarding-status';
import processReq from '../queries/process';
import validateOnboarding from '../queries/validate-onboarding';
import vaultReq from '../queries/vault';
import { lockBody } from '../utils/dom-utils';
import transformBeforeVault from '../utils/transform-before-vault';
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

    const data = transformBeforeVault(formValues, { vaultValues: context.vaultData }) as FormValues;
    await vaultReq({ data, bootstrapDis: [], authToken: vaultingToken });

    setContext({
      ...context,
      vaultData: {
        ...context.vaultData,
        ...data,
      },
    });
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
    const { requirements: requirementsBeforeProcess } = await getRequirementsReq({
      authToken: context.verifiedAuthToken,
    });
    requirementsBeforeProcess.all.forEach(req => {
      if (req.kind !== OnboardingRequirementKind.process && !req.isMet) {
        throw new InlineProcessError(
          'Cannot process without meeting all requirements. Please complete all requirements first or try handoff',
        );
      }
    });
    try {
      await processReq({ token: context.verifiedAuthToken });
    } catch (error: unknown) {
      throw new InlineProcessError((error as Error).message || 'Something happened');
    }
    const [{ validationToken }, { requirements }] = await Promise.all([
      validateOnboarding({ authToken: context.verifiedAuthToken }),
      getRequirementsReq({ authToken: context.verifiedAuthToken }),
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
    isReady: context.isReady,
    getRequirements,
    handoff,
    process,
    vault,
    ...otp,
    vaultData: context.vaultData,
  };
};

export default useFootprint;
