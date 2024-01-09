import { useTranslation } from '@onefootprint/hooks';
import { IcoTrash16 } from '@onefootprint/icons';
import { Box, IconButton, Stack, Typography } from '@onefootprint/ui';
import React from 'react';

type FileEntryProps = {
  file: File;
  onRemove: () => void;
};

const FileEntry = ({ file, onRemove }: FileEntryProps) => {
  const { t } = useTranslation(
    'investor-profile.pages.declarations.doc-upload',
  );

  return (
    <Stack align="center" justify="space-between" minHeight="32px">
      <Box>
        <Typography variant="body-3">{file.name}</Typography>
      </Box>
      <Box minWidth="32px">
        <IconButton aria-label={t('remove')} onClick={onRemove}>
          <IcoTrash16 color="error" />
        </IconButton>
      </Box>
    </Stack>
  );
};

export default FileEntry;
