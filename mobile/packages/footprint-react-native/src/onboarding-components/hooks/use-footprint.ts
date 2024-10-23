import { useContext } from 'react';

import { type FormValues, InlineProcessError, OnboardingStep } from '../../types';
import { Context } from '../components/provider';
import save from '../queries/save';
import fp from '../utils/browser';
import { formatBeforeSave } from '../utils/save-utils';
import useOtp from './use-otp';
import getRequirementsReq from '../queries/get-onboarding-status';
import processReq from '../queries/process';
import validateOnboarding from '../queries/validate-onboarding';

const useFootprint = () => {
  const [context] = useContext(Context);
  const otp = useOtp();

  const vault = async (formValues: FormValues) => {
    const { vaultingToken, onboardingConfig } = context;
    if (!vaultingToken) {
      throw new Error('No authToken found. Please authenticate first');
    }
    if (!onboardingConfig) {
      throw new Error('No onboardingConfig found. Please make sure that the publicKey is correct');
    }
    if (onboardingConfig.kind !== 'kyc') {
      throw new Error('Unsupported onboardingConfig kind');
    }
    await save({
      data: formatBeforeSave(formValues, context.locale ?? 'en-US'),
      bootstrapDis: [],
      authToken: vaultingToken,
    });
  };

  const handoff = ({
    onComplete,
    onError,
    onCancel,
  }: {
    onComplete?: (validationToken: string) => void;
    onError?: (error: unknown) => void;
    onCancel?: () => void;
  } = {}) => {
    const { verifiedAuthToken, appearance, redirectUrl, isReady } = context;
    if (!isReady) {
      onError?.(new Error('Footprint provider is not ready. Please make sure that the publicKey is correct'));
      return;
    }
    if (!verifiedAuthToken) {
      onError?.(new Error('No authToken found. Please authenticate first'));
      return;
    }
    if (!redirectUrl) {
      onError?.(new Error('No redirectUrl found. Please make sure to set the redirectUrl first'));
      return;
    }

    const component = fp.init({
      appearance,
      authToken: verifiedAuthToken,
      redirectUrl,
      sandboxOutcome: context.sandboxOutcome,
      onComplete: (validationToken: string) => {
        onComplete?.(validationToken);
      },
      onError: (error: unknown) => {
        onError?.(error);
      },
      onCancel: () => {
        onCancel?.();
      },
      step: OnboardingStep.Onboard,
    });
    component.render();
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
    const { requirements } = await getRequirementsReq({ authToken: context.verifiedAuthToken });
    requirements.all.forEach(req => {
      if (!req.isMet) {
        throw new InlineProcessError('Found a requirement not met. Handoff must be done');
      }
    });
    const { validationToken } = await validateOnboarding({ authToken: context.verifiedAuthToken });
    return { validationToken, requirements };
  };

  return {
    isReady: context.isReady,
    vault,
    handoff,
    getRequirements,
    process,
    ...otp,
  };
};

export default useFootprint;
