import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';

import { ApiError, type UserData, type UserDataError } from '../@types';
import { Context } from '../components/onboarding-components/provider';
import getOnboardingStatusReq from '../queries/get-onboarding-status';
import saveReq from '../queries/save';
import { lockBody, unlockBody } from '../utils/dom-utils';
import getVaultData from '../utils/get-vault-data';

export const useFootprint = () => {
  const [context, setContext] = useContext(Context);
  const form = useFormContext<UserData>();

  const getVaultFormData = () => {
    const values = form.getValues();
    return getVaultData(values);
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
        'id.phone_number': phoneNumber || form.getValues('id.phone_number'),
        'id.email': email || form.getValues('id.email'),
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
        if (typeof value === 'string') {
          form.setError(key, { message: value });
        }
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
      await saveReq({ data, bootstrapDis: [], authToken });
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
