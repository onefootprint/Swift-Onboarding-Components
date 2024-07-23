import { useContext } from 'react';

import { type FormValues, OnboardingStep } from '../../types';
import { Context } from '../components/provider';
import save from '../queries/save';
import fp from '../utils/browser';
import { formatBeforeSave } from '../utils/save-utils';
import useOtp from './use-otp';

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
    if (onboardingConfig.kind !== 'kyc' && onboardingConfig.kind !== 'kyb') {
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
    const { authToken, appearance } = context;
    if (!authToken) {
      onError?.(new Error('No authToken found. Please authenticate first'));
      return;
    }
    const component = fp.init({
      appearance,
      authToken,
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

  return {
    save: vault,
    handoff,
    launchIdentify: otp.launchIdentify,
    verifyChallenge: otp.verify,
    createChallenge: otp.create,
  };
};

export default useFootprint;
