import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { SummaryFormData } from '@/playbooks/utils/machine/types';
import {
  defaultPlaybookValuesKYC,
  OnboardingTemplate,
  PlaybookKind,
} from '@/playbooks/utils/machine/types';

import DataCollection from './components/data-collection/data-collection';

export type DataCollectionWithContextProps = {
  startingValues?: Partial<SummaryFormData>;
  kind: PlaybookKind;
};

const DataCollectionWithContext = ({
  startingValues,
  kind,
}: DataCollectionWithContextProps) => {
  const formMethods = useForm<SummaryFormData>({
    defaultValues: {
      ...defaultPlaybookValuesKYC,
      ...startingValues,
    },
  });
  return (
    <FormProvider {...formMethods}>
      <form>
        <DataCollection
          meta={{
            kind: kind ?? PlaybookKind.Kyc,
            residency: {
              allowUsResidents: true,
              allowUsTerritories: false,
              allowInternationalResidents: false,
            },
            onboardingTemplate: OnboardingTemplate.Custom,
          }}
        />
      </form>
    </FormProvider>
  );
};

export default DataCollectionWithContext;
