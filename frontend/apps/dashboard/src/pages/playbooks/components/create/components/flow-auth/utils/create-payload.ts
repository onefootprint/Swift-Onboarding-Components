import { OnboardingConfigKind, type OrgOnboardingConfigCreateRequest } from '@onefootprint/types';
import { createRequiredAuthMethodsPayload } from '../../../utils/create-payload';
import type { AuthDetailsFormData } from '../../step-auth-details';
import type { NameFormData } from '../../step-name';

const createAuthFlowPayload = ({
  nameForm,
  requiredAuthMethodsForm,
}: {
  nameForm: NameFormData;
  requiredAuthMethodsForm: AuthDetailsFormData;
}): OrgOnboardingConfigCreateRequest => {
  return {
    name: nameForm.name,
    kind: OnboardingConfigKind.auth,
    canAccessData: ['phone_number', 'email'],
    mustCollectData: ['phone_number', 'email'],
    skipKyc: false,
    ...createRequiredAuthMethodsPayload(requiredAuthMethodsForm),
  };
};

export default createAuthFlowPayload;
