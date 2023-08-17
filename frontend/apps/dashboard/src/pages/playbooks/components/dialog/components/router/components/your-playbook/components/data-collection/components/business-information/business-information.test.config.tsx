import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  BusinessInformation,
  defaultValuesKYB,
  FormData,
} from '../../../../your-playbook.types';
import BusinessInformationComponent from '.';

export type BusinessInformationWithContext = {
  startingValues: Partial<BusinessInformation>;
};

const BusinesssInformationWithContext = ({
  startingValues,
}: BusinessInformationWithContext) => {
  const formMethods = useForm<FormData>({
    defaultValues: {
      ...defaultValuesKYB,
      businessInformation: {
        ...defaultValuesKYB.businessInformation,
        ...startingValues,
      },
    },
  });
  return (
    <FormProvider {...formMethods}>
      <form>
        <BusinessInformationComponent />
      </form>
    </FormProvider>
  );
};

export default BusinesssInformationWithContext;
