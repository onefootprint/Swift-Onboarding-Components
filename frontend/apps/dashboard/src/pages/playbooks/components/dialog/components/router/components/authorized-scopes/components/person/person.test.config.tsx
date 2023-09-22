import { CollectedInvestorProfileDataOption } from '@onefootprint/types';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type {
  AuthorizedScopesFormData,
  personal,
  SummaryMeta,
} from '@/playbooks/utils/machine/types';
import {
  defaultAuthorizedScopesValues,
  defaultPlaybookValuesKYC,
  PlaybookKind,
} from '@/playbooks/utils/machine/types';

import PersonalScopes from './person';

export type PersonalScopesWithContextProps = {
  startingPersonalValues?: Partial<personal>;
  investorProfile?: boolean;
  meta?: SummaryMeta;
};

const PersonalScopesWithContext = ({
  startingPersonalValues,
  investorProfile,
  meta = {
    kind: PlaybookKind.Kyc,
    residency: {
      allowUsResidents: true,
      allowInternationalResidents: true,
      allowUsTerritories: false,
    },
  },
}: PersonalScopesWithContextProps) => {
  const formMethods = useForm<AuthorizedScopesFormData>({
    defaultValues: defaultAuthorizedScopesValues,
  });

  return (
    <FormProvider {...formMethods}>
      <form>
        <PersonalScopes
          meta={meta}
          playbook={{
            ...defaultPlaybookValuesKYC,
            personal: {
              ...defaultPlaybookValuesKYC.personal,
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
