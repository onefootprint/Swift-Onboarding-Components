import { isEmail, isPhoneNumber } from '@onefootprint/core';
import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';

import type { FormData, UserData } from '../@types';
import { Context } from '../components/provider';
import createD2pToken from '../queries/create-d2p-token';
import getD2PStatusReq from '../queries/get-d2p-status';
import getOnboardingStatusReq from '../queries/get-onboarding-status';
import identifyAndStartReq from '../queries/identify-and-start';
import identifyReq from '../queries/identify-user';
import saveReq from '../queries/save';
import createSignupChallenge from '../queries/signup';
import createHandoffUrlUtil from '../utils/create-handoff-url';

export const useFootprint = () => {
  const [context, setContext] = useContext(Context);
  const form = useFormContext<FormData>();

  const getVaultFormData = (): UserData => {
    const values = form.getValues();
    return {
      'id.first_name': values.firstName,
      'id.middle_name': values.middleName,
      'id.last_name': values.lastName,
      'id.dob': values.dob,
      'id.ssn4': values.ssn4,
      'id.ssn9': values.ssn9,
      'id.address_line1': values.addressLine1,
      'id.address_line2': values.addressLine2,
      'id.city': values.city,
      'id.state': values.state,
      'id.zip': values.zip,
      'id.country': values.country,
    };
  };

  const identify = async () => {
    const payload = {
      email: form.getValues('email'),
      phoneNumber: form.getValues('phoneNumber'),
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
        email: form.getValues('email'),
        phoneNumber: form.getValues('phoneNumber'),
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
    const email = form.getValues('email') || '';
    const phoneNumber = form.getValues('phoneNumber') || '';
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

  const createHandoffUrl = async () => {
    const { authToken, onboardingConfig } = context;
    if (!authToken || !onboardingConfig) {
      throw new Error('No authToken or onboardingConfig found');
    }
    const res = await createD2pToken({
      authToken,
      meta: {
        opener: 'unknown',
      },
    });
    setContext(prev => ({ ...prev, scopedAuthToken: res.authToken }));
    const url = createHandoffUrlUtil({
      authToken: res.authToken,
      onboardingConfig,
    });
    return { url, scopedAuthToken: res.authToken };
  };

  const getD2PStatus = async () => {
    const { scopedAuthToken } = context;
    if (!scopedAuthToken) {
      throw new Error('No authToken found');
    }
    return getD2PStatusReq({ scopedAuthToken });
  };

  const methods = {
    canInitiateOtpValidation,
    createHandoffUrl,
    getAuthToken,
    getD2PStatus,
    getMissingRequirements,
    identify,
    identifyAndAuthenticate,
    identifyAndStart,
    save,
  };

  return { form, context, ...methods };
};

export default useFootprint;
