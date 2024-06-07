import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { BusinessInformation, Personal, SummaryFormData } from '@/playbooks/utils/machine/types';
import { PlaybookKind, defaultPlaybookValuesKYC } from '@/playbooks/utils/machine/types';

import Editing from './editing';

export type EditingWithContextProps = {
  startingValues?: {
    personal?: Partial<Personal>;
    businessInformation?: Partial<BusinessInformation>;
  };
  kind?: PlaybookKind;
};

const EditingWithContext = ({ kind, startingValues }: EditingWithContextProps) => {
  const formMethods = useForm<SummaryFormData>({
    defaultValues: {
      ...defaultPlaybookValuesKYC,
      personal: {
        ...defaultPlaybookValuesKYC.personal,
        ...startingValues?.personal,
      },
      businessInformation: {
        ...startingValues?.businessInformation,
      },
    },
  });
  return (
    <FormProvider {...formMethods}>
      <form>
        <Editing
          onStopEditing={() => undefined}
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
