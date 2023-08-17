import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { defaultValuesKYC, FormData, Kind } from '../../your-playbook.types';
import DataCollection from './data-collection';

export type DataCollectionWithContextProps = {
  startingValues?: Partial<FormData>;
  kind: Kind;
};

const DataCollectionWithContext = ({
  startingValues,
  kind,
}: DataCollectionWithContextProps) => {
  const formMethods = useForm<FormData>({
    defaultValues: {
      ...defaultValuesKYC,
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
