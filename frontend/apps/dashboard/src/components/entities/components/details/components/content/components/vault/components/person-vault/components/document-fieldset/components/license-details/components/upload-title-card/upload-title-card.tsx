import { IcoWarning16 } from '@onefootprint/icons';
import type { DocumentUpload } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

export type UploadTitleCardProps = {
  upload: DocumentUpload;
};

const UploadTitleCard = ({ upload: { timestamp, failureReasons } }: UploadTitleCardProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'fieldset.documents.details' });
  const isSuccess = failureReasons.length === 0;

  return (
    <Stack
      maxWidth="100%"
      width="500px"
      gap={3}
      borderRadius="default"
      borderColor="tertiary"
      borderStyle="solid"
      borderWidth={1}
      paddingTop={2}
      paddingBottom={2}
      paddingRight={5}
      paddingLeft={5}
      backgroundColor="primary"
    >
      <Text variant="label-3">{format(new Date(timestamp), 'MM/dd/yy h:mma')}</Text>
      <Text tag="span" variant="label-3">
        ⋅
      </Text>
      {!isSuccess && <IcoWarning16 />}
      <Text variant="label-3" color={isSuccess ? 'primary' : 'error'}>
        {isSuccess ? t('status.success') : t('status.failed')}
      </Text>
    </Stack>
  );
};

export default UploadTitleCard;
