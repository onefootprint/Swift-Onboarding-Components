import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  defaultPlaybookValuesKYC,
  Kind,
  PlaybookFormData,
} from '@/playbooks/utils/machine/types';

import DataCollection from './data-collection';

export type DataCollectionWithContextProps = {
  startingValues?: Partial<PlaybookFormData>;
  kind: Kind;
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
        <DataCollection kind={kind ?? Kind.KYC} />
      </form>
    </FormProvider>
  );
};

export default DataCollectionWithContext;
