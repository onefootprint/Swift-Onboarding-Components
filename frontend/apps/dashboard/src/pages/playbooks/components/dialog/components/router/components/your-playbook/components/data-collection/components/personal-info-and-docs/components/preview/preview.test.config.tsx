import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type {
  PersonalInformationAndDocs,
  PlaybookFormData,
} from '@/playbooks/utils/machine/types';
import {
  defaultPlaybookValuesKYC,
  PlaybookKind,
} from '@/playbooks/utils/machine/types';

import Preview from './preview';

export type PreviewWithContextProps = {
  startingValues?: Partial<PersonalInformationAndDocs>;
  kind?: PlaybookKind;
};

const PreviewWithContext = ({
  startingValues,
  kind,
}: PreviewWithContextProps) => {
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
        <Preview startEditing={() => {}} kind={kind ?? PlaybookKind.Kyc} />
      </form>
    </FormProvider>
  );
};

export default PreviewWithContext;
