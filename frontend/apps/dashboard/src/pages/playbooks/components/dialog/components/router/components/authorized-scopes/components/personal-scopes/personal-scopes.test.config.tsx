import { CollectedInvestorProfileDataOption } from '@onefootprint/types';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type {
  AuthorizedScopesFormData,
  PersonalInformationAndDocs,
} from '@/playbooks/utils/machine/types';
import {
  defaultAuthorizedScopesValues,
  defaultPlaybookValuesKYC,
  PlaybookKind,
} from '@/playbooks/utils/machine/types';

import PersonalScopes from './personal-scopes';

export type PersonalScopesWithContextProps = {
  startingPersonalValues?: Partial<PersonalInformationAndDocs>;
  investorProfile?: boolean;
  kind?: PlaybookKind;
};

const PersonalScopesWithContext = ({
  startingPersonalValues,
  investorProfile,
  kind = PlaybookKind.Kyc,
}: PersonalScopesWithContextProps) => {
  const formMethods = useForm<AuthorizedScopesFormData>({
    defaultValues: defaultAuthorizedScopesValues,
  });

  return (
    <FormProvider {...formMethods}>
      <form>
        <PersonalScopes
          kind={kind}
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
