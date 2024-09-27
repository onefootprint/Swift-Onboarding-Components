import type { Icon } from '@onefootprint/icons';
import { IcoTrash16 } from '@onefootprint/icons';
import { Box, Button, Divider, IconButton, LinkButton, Stack, Text, createFontStyles } from '@onefootprint/ui';
import type React from 'react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export type UploadFileProps = {
  accept: string;
  children: React.ReactNode;
  cta: string;
  iconComponent: Icon;
  id: string;
  label: string;
  onChange: (value: string) => void;
  onRemove?: () => void;
};

const UploadFile = ({
  accept,
  children,
  cta,
  iconComponent: IconComponent,
  id,
  label,
  onChange,
  onRemove,
}: UploadFileProps) => {
  const { t } = useTranslation('proxy-configs', {
    keyPrefix: 'create.form.upload-file',
  });
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const readFile = async (file: File) => {
    const newValue = await file.text();
    onChange(newValue);
    setFileName(file.name);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    const [file] = event.target.files;
    readFile(file);
  };

  const handleRemove = () => {
    if (inputRef.current) inputRef.current.value = '';
    onChange('');
    setFileName('');
  };

  return (
    <Box>
      <Stack marginBottom={4} justify="space-between">
        <Label htmlFor={id}>
          <IconComponent />
          {label}
        </Label>
        {onRemove && (
          <LinkButton onClick={onRemove} destructive>
            {t('remove')}
          </LinkButton>
        )}
      </Stack>
      <Box backgroundColor="secondary" padding={5} borderRadius="default">
        <Box>
          <Button fullWidth onClick={handleClick} variant="secondary">
            {cta}
          </Button>
        </Box>
        {fileName ? (
          <>
            <Box marginTop={5} marginBottom={5}>
              <Divider />
            </Box>
            <Stack align="center" justify="space-between">
              <Box>
                <Text variant="body-3">{fileName}</Text>
              </Box>
              <IconButton aria-label={t('remove')} onClick={handleRemove}>
                <IcoTrash16 color="error" />
              </IconButton>
            </Stack>
          </>
        ) : (
          <>
            <Stack align="center" gap={3} marginTop={5} marginBottom={5}>
              <Divider />
              <Text color="quaternary" variant="body-3">
                {t('or')}
              </Text>
              <Divider />
            </Stack>
            {children}
          </>
        )}
      </Box>
      <HiddenInput accept={accept} ref={inputRef} type="file" onChange={handleChange} />
    </Box>
  );
};

const Label = styled.label`
  ${createFontStyles('label-3')};
  display: flex;
  align-items: center;
`;

const HiddenInput = styled.input`
  display: none;
`;

export default UploadFile;
