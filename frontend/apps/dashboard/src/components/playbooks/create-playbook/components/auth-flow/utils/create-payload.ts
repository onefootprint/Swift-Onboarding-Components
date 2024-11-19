import type { CreateOnboardingConfigurationRequest } from '@onefootprint/request-types/dashboard';
import { createRequiredAuthMethodsPayload } from '../../../utils/create-payload';
import type { NameFormData } from '../../name-step';
import type { AuthDetailsFormData } from '../components/auth-details-step';

const createAuthFlowPayload = ({
  nameForm,
  requiredAuthMethodsForm,
}: {
  nameForm: NameFormData;
  requiredAuthMethodsForm: AuthDetailsFormData;
}): CreateOnboardingConfigurationRequest => {
  return {
    name: nameForm.name,
    kind: 'auth',
    mustCollectData: ['phone_number', 'email'],
    verificationChecks: [{ kind: 'kyc', data: {} }],
    requiredAuthMethods: createRequiredAuthMethodsPayload(requiredAuthMethodsForm),
  };
};

export default createAuthFlowPayload;
