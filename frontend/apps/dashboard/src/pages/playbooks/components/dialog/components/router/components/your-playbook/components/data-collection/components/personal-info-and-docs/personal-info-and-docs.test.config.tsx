import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  defaultValuesKYC,
  FormData,
  Kind,
  PersonalInformationAndDocs,
} from '../../../../your-playbook.types';
import PersonalInfoAndDocs from './personal-info-and-docs';

export type PersonalInfoAndDocsWithContextProps = {
  startingValues: Partial<PersonalInformationAndDocs>;
  kind?: Kind;
};

const PersonalInfoAndDocsWithContext = ({
  startingValues,
  kind,
}: PersonalInfoAndDocsWithContextProps) => {
  const formMethods = useForm<FormData>({
    defaultValues: {
      ...defaultValuesKYC,
      personalInformationAndDocs: {
        ...defaultValuesKYC.personalInformationAndDocs,
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
