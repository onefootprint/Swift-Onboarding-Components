import { dateToIso8601 } from '@onefootprint/core';
import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';

import {
  ApiError,
  type FormData,
  type UserData,
  type UserDataError,
} from '../@types';
import { Context } from '../components/provider';
import getOnboardingStatusReq from '../queries/get-onboarding-status';
import saveReq from '../queries/save';
import { lockBody, unlockBody } from '../utils/dom-utils';
import userToFormData from '../utils/user-to-form-data';

export const useFootprint = () => {
  const [context, setContext] = useContext(Context);
  const form = useFormContext<FormData>();

  const getVaultFormData = (): UserData => {
    const values = form.getValues();
    return {
      'id.first_name': values.firstName,
      'id.middle_name': values.middleName,
      'id.last_name': values.lastName,
      'id.dob': values.dob ? dateToIso8601(values.dob) : undefined,
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

  const launchIdentify = ({
    email,
    phoneNumber,
    onDone,
  }: {
    email?: string;
    phoneNumber?: string;
    onDone: () => void;
  }) => {
    const fp = footprint.init({
      appearance: context.appearance,
      publicKey: context.publicKey,
      userData: {
        'id.phone_number': phoneNumber || form.getValues('phoneNumber'),
        'id.email': email || form.getValues('email'),
      },
      kind: FootprintComponentKind.Components,
      onComplete: context.onComplete,
      onError: context.onError,
      onCancel: context.onCancel,
      onRelayToComponents: (authToken: string) => {
        unlockBody();
        setContext(prev => ({ ...prev, authToken }));
        onDone();
      },
    });
    fp.render();
    setContext({ ...context, fpInstance: fp });
  };

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

  const handleError = (error: unknown) => {
    if (error instanceof ApiError) {
      const apiError = error as ApiError<UserDataError>;

      Object.entries(apiError.details.message).forEach(([key, value]) => {
        const formDataKey = userToFormData(key);
        if (!formDataKey || typeof value !== 'string') return;

        form.setError(
          formDataKey,
          { type: 'manual', message: value },
          { shouldFocus: true },
        );
      });
    }
  };

  const save = async () => {
    const { authToken } = context;
    if (!authToken) {
      throw new Error('No authToken found');
    }
    try {
      const data = getVaultFormData();
      await saveReq({ data, authToken });
    } catch (error: unknown) {
      handleError(error);
      throw error;
    }
    await getMissingRequirements(authToken);
  };

  const handoff = () => {
    if (!context.fpInstance) {
      throw new Error('No fpInstance found');
    }
    lockBody();
    context.fpInstance.relayFromComponents?.();
  };

  const methods = {
    handoff,
    launchIdentify,
    save,
  };

  return { form, context, ...methods };
};

export default useFootprint;
