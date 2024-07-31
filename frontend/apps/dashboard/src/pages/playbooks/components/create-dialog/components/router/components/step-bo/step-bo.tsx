import { type DataToCollectFormData, type DataToCollectMeta, PlaybookKind } from '@/playbooks/utils/machine/types';
import { InlineAlert, Stack } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Footer from '../footer';
import Header from '../header';

import AdditionalDocs from '../additional-docs';
import GovDocs from '../gov-docs';
import Person from '../person';

type StepBoProps = {
  defaultValues: DataToCollectFormData;
  meta: DataToCollectMeta;
  onBack: () => void;
  onSubmit: (data: DataToCollectFormData) => void;
};

const StepBo = ({ defaultValues, meta, onBack, onSubmit }: StepBoProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.bo' });
  const formMethods = useForm<DataToCollectFormData>({ defaultValues });
  const { handleSubmit } = formMethods;

  return (
    <Stack flexDirection="column" gap={8}>
      <Stack flexDirection="column" gap={5}>
        <Header title={t('title')} subtitle={t('subtitle')} />
        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)} id="step-bo-form">
            <Stack flexDirection="column" gap={5}>
              <Person meta={meta} />
              <GovDocs />
              <AdditionalDocs />
              <InlineAlert variant="info">{t('info')}</InlineAlert>
            </Stack>
          </form>
        </FormProvider>
      </Stack>
      <Footer onBack={onBack} form="step-bo-form" />
    </Stack>
  );
};

export default StepBo;
