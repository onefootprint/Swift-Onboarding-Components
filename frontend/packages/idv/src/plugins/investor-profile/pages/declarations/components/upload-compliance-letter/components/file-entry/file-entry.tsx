import { IcoTrash16 } from '@onefootprint/icons';
import { Box, IconButton, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type FileEntryProps = {
  file: File;
  onRemove: () => void;
};

const FileEntry = ({ file, onRemove }: FileEntryProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'investor-profile.pages.declarations.doc-upload',
  });

  return (
    <Stack align="center" justify="space-between" minHeight="32px">
      <Box>
        <Text variant="body-3">{file.name}</Text>
      </Box>
      <Box minWidth="32px">
        <IconButton aria-label={t('remove-aria-label')} onClick={onRemove}>
          <IcoTrash16 color="error" />
        </IconButton>
      </Box>
    </Stack>
  );
};

export default FileEntry;
