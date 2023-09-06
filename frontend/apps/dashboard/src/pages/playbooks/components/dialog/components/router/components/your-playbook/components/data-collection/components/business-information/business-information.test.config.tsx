import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type {
  BusinessInformation,
  PlaybookFormData,
} from '@/playbooks/utils/machine/types';
import { defaultPlaybookValuesKYB } from '@/playbooks/utils/machine/types';

import BusinessInformationComponent from '.';

export type BusinessInformationWithContext = {
  startingValues: Partial<BusinessInformation>;
};

const BusinesssInformationWithContext = ({
  startingValues,
}: BusinessInformationWithContext) => {
  const formMethods = useForm<PlaybookFormData>({
    defaultValues: {
      ...defaultPlaybookValuesKYB,
      businessInformation: {
        ...defaultPlaybookValuesKYB.businessInformation,
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
