import { isEmail, isPhoneNumber } from '@onefootprint/core';
import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';

import type { UserData } from '../@types';
import { Context } from '../components/provider';
// TODO: FIX THIS
import getOnboardingStatusReq from '../queries/get-onboarding-status';
import identifyAndStartReq from '../queries/identify-and-start';
import identifyReq from '../queries/identify-user';
import saveReq from '../queries/save';
import createSignupChallenge from '../queries/signup';
import createHandoffUrlUtil from '../utils/create-handoff-url';
import flattenFormData from '../utils/flatten-form-data';

export const useFootprint = () => {
  const [context, setContext] = useContext(Context);
  const form = useFormContext<UserData>();

  const getVaultFormData = () => {
    const values = form.getValues();
    const formValues = flattenFormData(values);
    delete formValues['id.email'];
    delete formValues['id.phone_number'];
    return formValues;
  };

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
        const { missingRequirements } = await getOnboardingStatusReq({
          authToken,
        });
        setContext(prev => ({ ...prev, missingRequirements }));
        return missingRequirements;
      } catch (e) {
        console.error(e);
      }
      return [];
    }

    throw new Error('No authToken found');
  };

  const identifyAndStart = async ({
    token,
    challengeResponse,
    challengeToken,
  }: {
    challengeResponse: string;
    challengeToken: string;
    token: string;
  }) => {
    const response = await identifyAndStartReq({
      challengeResponse,
      challengeToken,
      authToken: token,
      scope: 'onboarding',
    });
    setContext(prev => ({
      ...prev,
      missingRequirements: response.missingRequirements,
      onboardingConfig: response.onboardingConfig,
      authToken: response.authToken,
    }));
  };

  const save = async () => {
    const { authToken } = context;
    if (!authToken) {
      throw new Error('No authToken found');
    }
    const data = getVaultFormData();
    await saveReq({ data, authToken });
    await getMissingRequirements(authToken);
  };

  const createHandoffUrl = () => {
    const { authToken, onboardingConfig } = context;
    if (!authToken || !onboardingConfig) {
      throw new Error('authToken and onboardingConfig are required');
    }

    return createHandoffUrlUtil({ authToken, onboardingConfig });
  };

  const methods = {
    createHandoffUrl,
    canInitiateOtpValidation,
    getAuthToken,
    getMissingRequirements,
    handoff: async () => {},
    identify,
    identifyAndAuthenticate,
    identifyAndStart,
    save,
    verifyOtp: async () => {},
  };

  return { form, context, ...methods };
};

export default useFootprint;
