import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  defaultValues,
  FormData,
  PersonalInformationAndDocs,
} from '../../../../your-playbook.types';
import PersonalInfoAndDocs from './personal-info-and-docs';

export type PersonalInfoAndDocsWithContextProps = {
  startingValues: Partial<PersonalInformationAndDocs>;
};

const PersonalInfoAndDocsWithContext = ({
  startingValues,
}: PersonalInfoAndDocsWithContextProps) => {
  const formMethods = useForm<FormData>({
    defaultValues: {
      ...defaultValues,
      personalInformationAndDocs: {
        ...defaultValues.personalInformationAndDocs,
        ...startingValues,
      },
    },
  });
  return (
    <FormProvider {...formMethods}>
      <form>
        <PersonalInfoAndDocs />
      </form>
    </FormProvider>
  );
};

export default PersonalInfoAndDocsWithContext;
