import { FormProvider, useForm } from 'react-hook-form';

import type { DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { defaultPlaybookValuesKYC } from '@/playbooks/utils/machine/types';

import InvestorProfile from './investor';

export type InvestorProfileWithContextProps = {
  investorProfileAdded: boolean;
};

const InvestorProfileWithContext = ({ investorProfileAdded }: InvestorProfileWithContextProps) => {
  const formMethods = useForm<DataToCollectFormData>({
    defaultValues: {
      ...defaultPlaybookValuesKYC,
      person: {
        ...defaultPlaybookValuesKYC.person,
        investorProfile: investorProfileAdded,
      },
    },
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
