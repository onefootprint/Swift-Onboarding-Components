import { IcoInfo16 } from '@onefootprint/icons';
import type { DocumentUpload, IdDocImageProcessingError } from '@onefootprint/types';
import { Stack, Text, Tooltip } from '@onefootprint/ui';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import useFailureReasonText from './hooks';

export type UploadTitleCardProps = {
  upload: DocumentUpload;
};

const UploadTitleCard = ({ upload: { timestamp, failureReasons } }: UploadTitleCardProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'fieldset.documents.details' });
  const failureReasonT = useFailureReasonText();
  const isSuccess = !failureReasons || failureReasons.length === 0;

  return (
    <Stack
      maxWidth="100%"
      width="500px"
      align="center"
      gap={2}
      borderRadius="default"
      borderColor="tertiary"
      borderStyle="solid"
      borderWidth={1}
      paddingTop={2}
      paddingBottom={2}
      paddingRight={4}
      paddingLeft={4}
      backgroundColor="primary"
    >
      <Text variant="snippet-1">{format(new Date(timestamp), 'MM/dd/yy h:mma')}</Text>
      <Text tag="span" variant="label-3">
        ⋅
      </Text>
      <Text variant="label-3" color={isSuccess ? 'primary' : 'error'}>
        {isSuccess ? t('status.success') : t('status.failed')}
      </Text>
      {!isSuccess && (
        <Tooltip text={failureReasonT(failureReasons[0] as IdDocImageProcessingError)}>
          <IcoInfo16 color="tertiary" />
        </Tooltip>
      )}
    </Stack>
  );
};

export default UploadTitleCard;
