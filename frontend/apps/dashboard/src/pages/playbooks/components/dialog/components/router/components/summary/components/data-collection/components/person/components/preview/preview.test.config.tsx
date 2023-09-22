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

import Preview from './preview';

export type PreviewWithContextProps = {
  startingValues?: Partial<personal>;
  kind?: PlaybookKind;
};

const PreviewWithContext = ({
  startingValues,
  kind,
}: PreviewWithContextProps) => {
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
        <Preview
          onStartEditing={() => {}}
          meta={{
            kind: kind || PlaybookKind.Kyc,
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

export default PreviewWithContext;
