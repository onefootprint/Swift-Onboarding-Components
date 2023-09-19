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

import Editing from './editing';

export type EditingWithContextProps = {
  kind?: PlaybookKind;
  startingValues?: Partial<PersonalInformationAndDocs>;
};

const EditingWithContext = ({
  kind,
  startingValues,
}: EditingWithContextProps) => {
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
        <Editing stopEditing={() => {}} kind={kind ?? PlaybookKind.Kyc} />
      </form>
    </FormProvider>
  );
};

export default EditingWithContext;
