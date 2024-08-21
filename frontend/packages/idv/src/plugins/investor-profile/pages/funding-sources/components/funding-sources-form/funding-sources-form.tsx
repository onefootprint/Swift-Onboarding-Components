import type { InvestorProfileData } from '@onefootprint/types';
import { InvestorProfileDI, InvestorProfileFundingSources } from '@onefootprint/types';
import { Checkbox } from '@onefootprint/ui';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormWithErrorAndFooter from '../../../../components/form-with-error-footer';
import type { FundingSourcesData } from '../../../../utils/state-machine/types';

export type FundingSourcesFormProps = {
  defaultValues?: Pick<InvestorProfileData, InvestorProfileDI.fundingSources>;
  footer: React.ReactNode;
  onSubmit: (data: FundingSourcesData) => void;
};

type FormData = Record<InvestorProfileFundingSources, boolean>;

const { employmentIncome, investments, inheritance, businessIncome, savings, family } = InvestorProfileFundingSources;

const FundingSourcesForm = ({ defaultValues, footer, onSubmit }: FundingSourcesFormProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'investor-profile.pages.funding-sources',
  });
  const defaultEntries = (defaultValues?.[InvestorProfileDI.fundingSources] ?? []).map(source => [source, true]);
  const { handleSubmit, register, watch } = useForm<FormData>({
    defaultValues: Object.fromEntries(defaultEntries),
  });
  const [showError, setShowError] = useState(false);
  const hasEmptySelection =
    !watch(employmentIncome) &&
    !watch(investments) &&
    !watch(inheritance) &&
    !watch(businessIncome) &&
    !watch(savings) &&
    !watch(family);

  const handleBeforeSubmit = (data: FormData) => {
    if (hasEmptySelection) {
      setShowError(true);
      return;
    }
    onSubmit({
      [InvestorProfileDI.fundingSources]: Object.entries(data)
        .filter(([, value]) => !!value)
        .map(([key]) => key as InvestorProfileFundingSources),
    });
  };

  return (
    <FormWithErrorAndFooter
      error={hasEmptySelection && showError ? t('empty-selection') : undefined}
      footer={footer}
      formAttributes={{ onSubmit: handleSubmit(handleBeforeSubmit) }}
    >
      <Checkbox label={t(employmentIncome)} {...register(employmentIncome)} />
      <Checkbox label={t(investments)} {...register(investments)} />
      <Checkbox label={t(inheritance)} {...register(inheritance)} />
      <Checkbox label={t(businessIncome)} {...register(businessIncome)} />
      <Checkbox label={t(savings)} {...register(savings)} />
      <Checkbox label={t(family)} {...register(family)} />
    </FormWithErrorAndFooter>
  );
};

export default FundingSourcesForm;
