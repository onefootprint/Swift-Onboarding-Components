import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type {
  PersonalInformationAndDocs,
  SummaryFormData,
} from '@/playbooks/utils/machine/types';
import {
  defaultPlaybookValuesKYC,
  PlaybookKind,
} from '@/playbooks/utils/machine/types';

import PersonalInfoAndDocs from './personal-info-and-docs';

export type PersonalInfoAndDocsWithContextProps = {
  startingValues: Partial<PersonalInformationAndDocs>;
  kind?: PlaybookKind;
};

const PersonalInfoAndDocsWithContext = ({
  startingValues,
  kind,
}: PersonalInfoAndDocsWithContextProps) => {
  const formMethods = useForm<SummaryFormData>({
    defaultValues: {
      ...defaultPlaybookValuesKYC,
      personalInformationAndDocs: {
        ...defaultPlaybookValuesKYC.personalInformationAndDocs,
        ...startingValues,
      },
    },
  });
  return (
    <FormProvider {...formMethods}>
      <form>
        <PersonalInfoAndDocs
          meta={{
            kind: kind ?? PlaybookKind.Kyc,
            residency: {
              allowUsResidents: true,
              allowUsTerritories: false,
              allowInternationalResidents: false,
            },
          }}
        />
      </form>
    </FormProvider>
  );
};

export default PersonalInfoAndDocsWithContext;
