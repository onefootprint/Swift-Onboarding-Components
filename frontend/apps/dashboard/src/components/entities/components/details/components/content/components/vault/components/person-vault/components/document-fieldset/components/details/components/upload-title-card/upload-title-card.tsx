import type { DocumentUpload } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import useUploadSideText from '../../../../hooks/use-upload-side-text';

export type UploadTitleCardProps = {
  upload: DocumentUpload & { isLatest: boolean };
  customTimestamp?: string;
  rightChildren?: React.ReactNode;
};

const UploadTitleCard = ({
  upload: { timestamp, failureReasons, isLatest, side },
  customTimestamp,
  rightChildren,
}: UploadTitleCardProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'fieldset.documents.details' });
  const sideT = useUploadSideText();
  const isSuccess = !failureReasons || failureReasons.length === 0;

  return (
    <Stack
      maxWidth="100%"
      width="100%"
      justify="space-between"
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
      <Stack gap={2} align="center">
        <Text variant="snippet-1" truncate>
          {customTimestamp ?? format(new Date(timestamp), 'MM/dd/yy h:mma')}
        </Text>
        <Text tag="span" variant="label-3">
          ⋅
        </Text>
        <Text variant="label-3" color={isSuccess ? 'primary' : 'error'} truncate>
          {isSuccess ? t('status.success') : t('status.failed')}
        </Text>
        {isLatest && (
          <Text variant="label-3" truncate>
            {t('title-card.latest', { side: sideT(side) })}
          </Text>
        )}
      </Stack>
      {rightChildren}
    </Stack>
  );
};

export default UploadTitleCard;
