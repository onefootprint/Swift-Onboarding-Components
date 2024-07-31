import { type DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { Stack } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Footer from '../footer';
import Header from '../header';

import Business from './components/business-info';
import CustomDocs from './components/custom-docs';

type StepBusinessProps = {
  defaultValues: DataToCollectFormData;
  onBack: () => void;
  onSubmit: (data: DataToCollectFormData) => void;
};

const StepBusiness = ({ defaultValues, onBack, onSubmit }: StepBusinessProps) => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.business.business-info',
  });
  const formMethods = useForm<DataToCollectFormData>({ defaultValues });
  const { handleSubmit } = formMethods;

  return (
    <Stack flexDirection="column" gap={8}>
      <Stack flexDirection="column" gap={5}>
        <Header title={t('title')} subtitle={t('subtitle')} />
        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)} id="step-business-form">
            <Stack flexDirection="column" gap={5}>
              <Business />
              <CustomDocs />
            </Stack>
          </form>
        </FormProvider>
      </Stack>
      <Footer onBack={onBack} form="step-business-form" />
    </Stack>
  );
};

export default StepBusiness;
