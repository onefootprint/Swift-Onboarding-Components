import { useTranslation } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
import { Box, Button, Divider, Grid } from '@onefootprint/ui';
import React, { useEffect, useRef, useState } from 'react';

import FileEntry from '../file-entry';

type UploadFilesProps = {
  onChange: (files: File[]) => void;
};

// TODO: For now, we are restricted by API to upload only one file even though
// this component supports multiple files
const UploadFiles = ({ onChange }: UploadFilesProps) => {
  const { t } = useTranslation('pages.declarations.doc-upload');
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) {
      return;
    }
    const { files: uploads } = event.target;

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
    setFiles([uploads[0]]);
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
    <Box
      backgroundColor="secondary"
      padding={5}
      borderRadius="default"
      gap={5}
      sx={{
        display: 'grid',
      }}
    >
      <Box>
        <Button
          fullWidth
          onClick={() => {
            inputRef.current?.click();
          }}
          variant="secondary"
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
                }}
              />
            ))}
          </Grid.Container>
        </>
      )}
    </Box>
  );
};

const HiddenInput = styled.input`
  display: none;
`;

export default UploadFiles;
