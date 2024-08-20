import { type DataToCollectFormData, type DataToCollectMeta } from '@/playbooks/utils/machine/types';
import { InlineAlert, Stack } from '@onefootprint/ui';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
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
  const { handleSubmit, control } = formMethods;
  const collectsBo = useWatch({ control, name: 'business.basic.collectBOInfo', defaultValue: true });

  return (
    <Stack flexDirection="column" gap={8}>
      <Stack flexDirection="column" gap={5}>
        <Header title={t('title')} subtitle={t('subtitle')} />
        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)} id="step-bo-form">
            <Stack flexDirection="column" gap={5}>
              <Person meta={meta} />
              {collectsBo ? (
                <>
                  <GovDocs />
                  <AdditionalDocs />
                </>
              ) : null}
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
