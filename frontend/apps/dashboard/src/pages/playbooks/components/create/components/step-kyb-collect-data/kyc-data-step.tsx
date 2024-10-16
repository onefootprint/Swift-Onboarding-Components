import { Stack } from '@onefootprint/ui';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AdditionalDocs from '../additional-docs';
import KycPerson from '../collect-kyc-person';
import GovDocs from '../gov-docs';
import Header from '../header';
import Investor from '../investor';
import type { KycTemplatesFormData } from '../step-kyc-templates';
import type { ResidencyFormData } from '../step-residency';
import type { KycFormData } from './kyc-data-step.types';

export type KycDataStep = {
  defaultValues: KycFormData;
  onBack: () => void;
  onSubmit: (data: KycFormData) => void;
  meta: {
    canEdit: boolean;
    residencyForm: ResidencyFormData;
    templateForm: KycTemplatesFormData;
  };
};

const KycDataStep = ({ onSubmit, onBack, defaultValues, meta }: KycDataStep) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.settings-person' });
  const form = useForm<KycFormData>({ defaultValues });
  const title = meta.canEdit ? t('title') : t('non-editable.title');
  const subtitle = meta.canEdit ? t('subtitle') : t('non-editable.subtitle');

  return (
    <Stack direction="column" gap={7} width="520px" whiteSpace="pre-wrap">
      <Header title={title} subtitle={subtitle} />
      <FormProvider {...form}>
        <form
          id="playbook-form"
          onSubmit={form.handleSubmit(onSubmit)}
          onReset={e => {
            e.preventDefault();
            onBack();
          }}
        >
          <Stack direction="column" gap={7}>
            <KycPerson meta={meta} />
            <GovDocs />
            <AdditionalDocs />
            <Investor />
          </Stack>
        </form>
      </FormProvider>
    </Stack>
  );
};

export default KycDataStep;
