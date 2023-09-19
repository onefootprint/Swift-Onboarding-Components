import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { SummaryFormData } from '@/playbooks/utils/machine/types';
import {
  defaultPlaybookValuesKYC,
  PlaybookKind,
} from '@/playbooks/utils/machine/types';

import DataCollection from './data-collection';

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
        <DataCollection kind={kind ?? PlaybookKind.Kyc} />
      </form>
    </FormProvider>
  );
};

export default DataCollectionWithContext;
