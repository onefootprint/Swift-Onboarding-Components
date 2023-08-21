import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  defaultPlaybookValuesKYC,
  Kind,
  PlaybookFormData,
} from '@/playbooks/utils/machine/types';

import Editing from './editing';

export type EditingWithContextProps = {
  kind?: Kind;
};

const EditingWithContext = ({ kind }: EditingWithContextProps) => {
  const formMethods = useForm<PlaybookFormData>({
    defaultValues: defaultPlaybookValuesKYC,
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
