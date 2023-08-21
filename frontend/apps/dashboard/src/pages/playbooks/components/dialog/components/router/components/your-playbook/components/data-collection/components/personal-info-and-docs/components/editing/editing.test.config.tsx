import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  defaultPlaybookValuesKYC,
  Kind,
  PersonalInformationAndDocs,
  PlaybookFormData,
} from '@/playbooks/utils/machine/types';

import Editing from './editing';

export type EditingWithContextProps = {
  kind?: Kind;
  startingValues?: Partial<PersonalInformationAndDocs>;
};

const EditingWithContext = ({
  kind,
  startingValues,
}: EditingWithContextProps) => {
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
        <Editing stopEditing={() => {}} kind={kind ?? Kind.KYC} />
      </form>
    </FormProvider>
  );
};

export default EditingWithContext;
