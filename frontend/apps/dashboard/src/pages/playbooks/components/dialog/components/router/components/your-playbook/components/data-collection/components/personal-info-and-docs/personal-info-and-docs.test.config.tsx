import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type {
  PersonalInformationAndDocs,
  PlaybookFormData,
} from '@/playbooks/utils/machine/types';
import {
  defaultPlaybookValuesKYC,
  Kind,
} from '@/playbooks/utils/machine/types';

import PersonalInfoAndDocs from './personal-info-and-docs';

export type PersonalInfoAndDocsWithContextProps = {
  startingValues: Partial<PersonalInformationAndDocs>;
  kind?: Kind;
};

const PersonalInfoAndDocsWithContext = ({
  startingValues,
  kind,
}: PersonalInfoAndDocsWithContextProps) => {
  const formMethods = useForm<PlaybookFormData>({
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
        <PersonalInfoAndDocs kind={kind ?? Kind.KYC} />
      </form>
    </FormProvider>
  );
};

export default PersonalInfoAndDocsWithContext;
