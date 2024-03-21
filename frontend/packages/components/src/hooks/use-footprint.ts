import { isEmail, isPhoneNumber } from '@onefootprint/core';
import type { OnboardingRequirement } from '@onefootprint/types';
import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';

import type { UserData } from '../@types';
import { Context } from '../components/provider';
import getMissingRequirementsReq from '../queries/get-missing-requirements';
import identifyReq from '../queries/identify-user';
import createSignupChallenge from '../queries/signup';

export const useFootprint = () => {
  const [context, setContext] = useContext(Context);
  const form = useFormContext<UserData>();

  const identify = async () => {
    const payload = {
      email: form.getValues('id.email'),
      phoneNumber: form.getValues('id.phone_number'),
      scope: 'onboarding',
      sandboxId: context.sandboxId,
      obConfigAuth: context.publicKey,
    };
    const response = await identifyReq(payload);
    return response;
  };

  const identifyAndAuthenticate = async () => {
    const identifyRes = await identify();

    // TODO: do sign-in
    if (!identifyRes.user) {
      const payload = {
        email: form.getValues('id.email'),
        phoneNumber: form.getValues('id.phone_number'),
        scope: 'onboarding',
        sandboxId: context.sandboxId,
        obConfigAuth: context.publicKey,
      };
      const response = await createSignupChallenge(payload);
      setContext(prev => ({
        ...prev,
        signupChallenge: response,
      }));
      return response;
    }
    return null;
  };

  const canInitiateOtpValidation = () => {
    const email = form.getValues('id.email');
    const phoneNumber = form.getValues('id.phone_number');
    return isEmail(email) || isPhoneNumber(phoneNumber);
  };

  const getAuthToken = () => context.authToken;

  const getMissingRequirements = async (token?: string) => {
    const authToken = token || context.authToken;
    if (authToken) {
      try {
        const response = await getMissingRequirementsReq({ authToken });
        setContext(prev => ({ ...prev, missingRequirements: response }));
        return response;
      } catch (e) {
        console.error(e);
      }
      return [];
    }

    throw new Error('No authToken found');
  };

  const updateAuthToken = (authToken: string) => {
    setContext(prev => ({ ...prev, authToken }));
  };

  const updateMissingRequirements = (
    missingRequirements: OnboardingRequirement[],
  ) => {
    setContext(prev => ({ ...prev, missingRequirements }));
  };

  const methods = {
    identify,
    identifyAndAuthenticate,
    canInitiateOtpValidation,
    getAuthToken,
    getMissingRequirements,
    save: async () => {},
    verifyOtp: async () => {},
    handoff: async () => {},
    updateAuthToken,
    updateMissingRequirements,
  };

  return { form, context, ...methods };
};

export default useFootprint;
