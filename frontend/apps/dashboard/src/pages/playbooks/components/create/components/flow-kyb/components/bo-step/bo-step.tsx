import { InlineAlert, Stack } from '@onefootprint/ui';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { BoFormData } from './bo-step.types';
import BOBasicData from './components/bo-basic-data';

import AdditionalDocs from '../../../additional-docs';
import GovDocs from '../../../gov-docs';
import Header from '../../../header';

type BoStepProps = {
  defaultValues: BoFormData;
  onBack: () => void;
  onSubmit: (data: BoFormData) => void;
};

const BoStep = ({ defaultValues, onBack, onSubmit }: BoStepProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.bo' });
  const formMethods = useForm<BoFormData>({ defaultValues });
  const { handleSubmit, control } = formMethods;
  const collectsBo = useWatch({ control, name: 'data.collect' });

  return (
    <Stack flexDirection="column" gap={8}>
      <Stack flexDirection="column" gap={5}>
        <Header title={t('title')} subtitle={t('subtitle')} />
        <FormProvider {...formMethods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            id="playbook-form"
            onReset={event => {
              event.preventDefault();
              onBack();
            }}
          >
            <Stack flexDirection="column" gap={5}>
              <BOBasicData />
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
    </Stack>
  );
};

export default BoStep;
