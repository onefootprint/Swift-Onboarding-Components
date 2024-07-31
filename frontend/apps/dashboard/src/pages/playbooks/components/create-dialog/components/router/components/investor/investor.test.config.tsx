import { CollectedInvestorProfileDataOption } from '@onefootprint/types';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { defaultPlaybookValuesKYC } from '@/playbooks/utils/machine/types';

import InvestorProfile from './investor';

export type InvestorProfileWithContextProps = {
  investorProfileAdded: boolean;
};

const InvestorProfileWithContext = ({ investorProfileAdded }: InvestorProfileWithContextProps) => {
  const defaultValues = {
    ...defaultPlaybookValuesKYC,
    [CollectedInvestorProfileDataOption.investorProfile]: investorProfileAdded,
  };

  const formMethods = useForm<DataToCollectFormData>({
    defaultValues,
  });

  return (
    <FormProvider {...formMethods}>
      <form>
        <InvestorProfile />
      </form>
    </FormProvider>
  );
};

export default InvestorProfileWithContext;
