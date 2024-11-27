import type { Entity } from '@onefootprint/request-types/dashboard';
import { InlineAlert, Radio, Stack, Text } from '@onefootprint/ui';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type RequestType = 'uploadDocument' | 'addBo';

type KindFormProps = {
  children: (requestType: RequestType) => React.ReactNode;
  entity: Entity;
};

const KindForm = ({ children, entity }: KindFormProps) => {
  const { t } = useTranslation('business-details', { keyPrefix: 'request-more-info.kind-form' });
  const { register, control } = useForm<{ requestType: RequestType }>({
    defaultValues: { requestType: 'uploadDocument' },
  });
  const requestType = useWatch({ control, name: 'requestType' });
  const showStatusWarning = entity.status === 'in_progress' || entity.status === 'incomplete';
  const showRequestBosOption = !!entity.workflows.length;

  return (
    <>
      {showStatusWarning && (
        <InlineAlert variant="warning" marginBottom={7}>
          {t('warning')}
        </InlineAlert>
      )}
      <Stack direction="column" gap={4} marginBottom={7}>
        <Radio label={t('upload-doc.label')} value="uploadDocument" {...register('requestType')} />
        {showRequestBosOption && (
          <Radio label={t('add-bo.label')} hint={t('add-bo.hint')} value="addBo" {...register('requestType')} />
        )}
      </Stack>
      <Text variant="body-3" marginBottom={7}>
        {requestType === 'uploadDocument' ? t('upload-doc.instructions') : t('add-bo.instructions')}
      </Text>
      {children(requestType)}
    </>
  );
};

export default KindForm;
