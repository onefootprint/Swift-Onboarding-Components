import { Stack } from '@onefootprint/ui';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { BusinessFormData } from './business-step.types';
import Business from './components/business';
import CustomDocs from './components/custom-docs';

import Header from '../../../header';

type BusinessStepProps = {
  defaultValues: BusinessFormData;
  onBack: () => void;
  onSubmit: (data: BusinessFormData) => void;
};

const BusinessStep = ({ defaultValues, onBack, onSubmit }: BusinessStepProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.business' });
  const formMethods = useForm<BusinessFormData>({ defaultValues });
  const { handleSubmit } = formMethods;

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
              <Business />
              <CustomDocs />
            </Stack>
          </form>
        </FormProvider>
      </Stack>
    </Stack>
  );
};

export default BusinessStep;
