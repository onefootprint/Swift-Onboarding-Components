import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';

import { Context } from '../components/provider';
import type { UserData } from '../types';
import getMissingRequirements from './utils/get-missing-requirements';
import userExists from './utils/user-exists';

export const useFootprint = () => {
  const fp = useContext(Context);
  const form = useFormContext<UserData>();

  const utils = {
    userExists: async () => {
      const payload = {
        email: form.getValues('id.email'),
        phoneNumber: form.getValues('id.phone_number'),
      };
      const response = await userExists(payload);
      return response;
    },
    canInitiateOtpValidation: () => {
      // TODO: Needs to check if email and phone are valid
      const email = form.getValues('id.email');
      const phoneNumber = form.getValues('id.phone_number');
      return !!email && !!phoneNumber;
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
