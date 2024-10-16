import { Stack } from '@onefootprint/ui';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AdditionalDocs from '../../../additional-docs';
import GovDocs from '../../../gov-docs';
import Header from '../../../header';
import Investor from '../../../investor';
import type { ResidencyFormData } from '../../../step-residency';
import Person from '../person';
import type { TemplatesFormData } from '../templates-step';
import type { DetailsFormData } from './details-step.types';

export type DetailsStep = {
  defaultValues: DetailsFormData;
  onBack: () => void;
  onSubmit: (data: DetailsFormData) => void;
  meta: {
    canEdit: boolean;
    residencyForm: ResidencyFormData;
    templateForm: TemplatesFormData;
  };
};

const DetailsStep = ({ onSubmit, onBack, defaultValues, meta }: DetailsStep) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.settings-person' });
  const form = useForm<DetailsFormData>({ defaultValues });
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
            <Person meta={meta} />
            <GovDocs />
            <AdditionalDocs />
            <Investor />
          </Stack>
        </form>
      </FormProvider>
    </Stack>
  );
};

export default DetailsStep;
