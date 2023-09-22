import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type {
  personal,
  SummaryFormData,
} from '@/playbooks/utils/machine/types';
import {
  defaultPlaybookValuesKYC,
  PlaybookKind,
} from '@/playbooks/utils/machine/types';

import Editing from './editing';

export type EditingWithContextProps = {
  kind?: PlaybookKind;
  startingValues?: Partial<personal>;
};

const EditingWithContext = ({
  kind,
  startingValues,
}: EditingWithContextProps) => {
  const formMethods = useForm<SummaryFormData>({
    defaultValues: {
      ...defaultPlaybookValuesKYC,
      personal: {
        ...defaultPlaybookValuesKYC.personal,
        ...startingValues,
      },
    },
  });
  return (
    <FormProvider {...formMethods}>
      <form>
        <Editing
          onStopEditing={() => {}}
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

export default EditingWithContext;
