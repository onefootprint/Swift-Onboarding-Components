import { CollectedInvestorProfileDataOption } from '@onefootprint/types';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  AuthorizedScopesFormData,
  defaultAuthorizedScopesValues,
  defaultPlaybookValuesKYC,
  PersonalInformationAndDocs,
} from '@/playbooks/utils/machine/types';

import PersonalScopes from './personal-scopes';

export type PersonalScopesWithContextProps = {
  startingPersonalValues?: Partial<PersonalInformationAndDocs>;
  investorProfile?: boolean;
};

const PersonalScopesWithContext = ({
  startingPersonalValues,
  investorProfile,
}: PersonalScopesWithContextProps) => {
  const formMethods = useForm<AuthorizedScopesFormData>({
    defaultValues: defaultAuthorizedScopesValues,
  });

  return (
    <FormProvider {...formMethods}>
      <form>
        <PersonalScopes
          playbook={{
            ...defaultPlaybookValuesKYC,
            personalInformationAndDocs: {
              ...defaultPlaybookValuesKYC.personalInformationAndDocs,
              ...startingPersonalValues,
            },
            [CollectedInvestorProfileDataOption.investorProfile]:
              investorProfile ?? false,
          }}
        />
      </form>
    </FormProvider>
  );
};

export default PersonalScopesWithContext;
