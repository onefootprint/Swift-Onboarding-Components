import { IcoInfo16 } from '@onefootprint/icons';
import { Box, Button, Divider, Grid, Stack, Text } from '@onefootprint/ui';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import FileEntry from '../file-entry';

type UploadFilesProps = {
  selectedFiles?: File[];
  onChange: (files: File[]) => void;
};

// TODO: For now, we are restricted by API to upload only one file even though
// this component supports multiple files
const UploadFiles = ({ onChange, selectedFiles }: UploadFilesProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'investor-profile.pages.declarations.doc-upload' });
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>(selectedFiles || []);
  const [showFileSizeError, setShowFileSizeError] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) {
      return;
    }
    const { files: uploads } = event.target;
    const sizeLimit = 5 * 1024 * 1024; // 5MB
    const isOverLimit = Array.from(uploads).some(file => file.size > sizeLimit);
    if (isOverLimit) {
      setShowFileSizeError(true);
    } else {
      // TODO: uncomment when we support multiple files
      // Update the state with new files
      // setFiles(current => {
      //   // Filter out files with colluding names
      //   const names = new Set(files.map(file => file.name));
      //   const filtered = Array.from(uploads).filter(
      //     file => !names.has(file.name),
      //   );
      //   return [...current, ...filtered];
      // });

      // Only save the first file
      setShowFileSizeError(false);
      setFiles([uploads[0]]);
    }
  };

  // TODO: uncomment when we support multiple files
  // const removeFileAtIndex = (index: number) => {
  //   setFiles(current => {
  //     const filtered = [...current];
  //     filtered.splice(index, 1);
  //     return filtered;
  //   });
  // };

  useEffect(() => {
    // Submit the loaded files
    onChange(files);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  return (
    <Stack direction="column" gap={3}>
      <Box backgroundColor="secondary" padding={5} borderRadius="default" gap={5} display="grid">
        <Box>
          <Button
            fullWidth
            onClick={() => {
              inputRef.current?.click();
            }}
            variant="secondary"
            size="large"
          >
            {/* TODO: uncomment when we support multiple files */}
            {/* {files.length > 0 ? t('cta-multiple') : t('cta')} */}
            {t('cta')}
          </Button>
        </Box>
        <HiddenInput
          accept=".pdf"
          // TODO: uncomment when we support multiple files
          // multiple
          type="file"
          ref={inputRef}
          data-testid="file-upload-input"
          onChange={handleChange}
        />
        {files.length > 0 && (
          <>
            <Divider />
            <Grid.Container gap={2}>
              {files.map(file => (
                <FileEntry
                  // We enforce unique file names, so there won't be duplicate keys
                  key={file.name}
                  file={file}
                  onRemove={() => {
                    // TODO: uncomment when we support multiple files
                    // removeFileAtIndex(index);
                    setFiles([]);
                    setShowFileSizeError(false);
                  }}
                />
              ))}
            </Grid.Container>
          </>
        )}
      </Box>
      <Stack center>
        {showFileSizeError ? (
          <Text color="error" variant="caption-3">
            {t('size-limit-error')}
          </Text>
        ) : (
          <Text color="quaternary" variant="caption-3" display="flex" gap={2}>
            <IcoInfo16 color="quaternary" />
            {t('hint')}
          </Text>
        )}
      </Stack>
    </Stack>
  );
};

const HiddenInput = styled.input`
  display: none;
`;

export default UploadFiles;
