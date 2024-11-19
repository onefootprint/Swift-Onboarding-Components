import { Stack } from '@onefootprint/ui';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AdditionalDocs from '../../../additional-docs';
import GovDocs from '../../../gov-docs';
import Header from '../../../header';

import type { DocumentsDetailsFormData } from './step-document-details.types';

export type DocumentDetailsStepProps = {
  defaultValues: DocumentsDetailsFormData;
  onBack: () => void;
  onSubmit: (data: DocumentsDetailsFormData) => void;
};

const DocumentDetailsStep = ({ onSubmit, onBack, defaultValues }: DocumentDetailsStepProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.settings-auth' });
  const form = useForm<DocumentsDetailsFormData>({ defaultValues });

  return (
    <Stack direction="column" gap={7} width="520px" whiteSpace="pre-wrap">
      <Header title={t('title')} subtitle={t('subtitle')} />
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
            <GovDocs />
            <AdditionalDocs />
          </Stack>
        </form>
      </FormProvider>
    </Stack>
  );
};

export default DocumentDetailsStep;
