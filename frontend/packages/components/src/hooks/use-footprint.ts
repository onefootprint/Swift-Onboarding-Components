import { isEmail, isPhoneNumber } from '@onefootprint/core';
import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';

import type { UserData } from '../@types';
import { Context } from '../components/provider';
import getMissingRequirements from '../queries/get-missing-requirements';
import identify from '../queries/identify-user';

export const useFootprint = () => {
  const fp = useContext(Context);
  const form = useFormContext<UserData>();

  const utils = {
    identify: async () => {
      const payload = {
        email: form.getValues('id.email'),
        phoneNumber: form.getValues('id.phone_number'),
        scope: 'onboarding',
        sandboxId: fp.sandboxId,
        obConfigAuth: fp.publicKey,
      };
      const response = await identify(payload);
      return response;
    },
    canInitiateOtpValidation: () => {
      const email = form.getValues('id.email');
      const phoneNumber = form.getValues('id.phone_number');
      return isEmail(email) || isPhoneNumber(phoneNumber);
    },
    getAuthToken: () => fp.authToken,
    getMissingRequirements: () => {
      const { authToken } = fp;
      if (!authToken) {
        throw new Error('No authToken found');
      }
      return getMissingRequirements({ authToken });
    },
    save: async () => {},
    verifyOtp: async () => {},
    handoff: async () => {},
  };

  return { fp, form, ...utils };
};

export default useFootprint;
