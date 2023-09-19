import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { PlaybookFormData } from '@/playbooks/utils/machine/types';
import {
  defaultPlaybookValuesKYC,
  PlaybookKind,
} from '@/playbooks/utils/machine/types';

import DataCollection from './data-collection';

export type DataCollectionWithContextProps = {
  startingValues?: Partial<PlaybookFormData>;
  kind: PlaybookKind;
};

const DataCollectionWithContext = ({
  startingValues,
  kind,
}: DataCollectionWithContextProps) => {
  const formMethods = useForm<PlaybookFormData>({
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
