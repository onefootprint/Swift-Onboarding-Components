import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  type PersonalInformationAndDocs,
  defaultValuesKYC,
  FormData,
  Kind,
} from '../../../../../../your-playbook.types';
import Preview from './preview';

export type PreviewWithContextProps = {
  startingValues?: Partial<PersonalInformationAndDocs>;
  kind?: Kind;
};

const PreviewWithContext = ({
  startingValues,
  kind,
}: PreviewWithContextProps) => {
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
        <Preview startEditing={() => {}} kind={kind ?? Kind.KYC} />
      </form>
    </FormProvider>
  );
};

export default PreviewWithContext;
