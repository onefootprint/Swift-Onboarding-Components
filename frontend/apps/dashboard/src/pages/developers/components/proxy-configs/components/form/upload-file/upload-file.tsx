import { useTranslation } from '@onefootprint/hooks';
import type { Icon } from '@onefootprint/icons';
import { IcoTrash16 } from '@onefootprint/icons';
import styled from '@onefootprint/styled';
import {
  Box,
  Button,
  createFontStyles,
  Divider,
  IconButton,
  LinkButton,
  Typography,
} from '@onefootprint/ui';
import React, { useRef, useState } from 'react';

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
  const { t } = useTranslation('pages.proxy-configs.create.form.upload-file');
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
      <Box
        sx={{
          display: 'flex',
          marginBottom: 4,
          justifyContent: 'space-between',
        }}
      >
        <Label htmlFor={id}>
          <IconComponent />
          {label}
        </Label>
        {onRemove && (
          <LinkButton onClick={onRemove} variant="destructive" size="compact">
            {t('remove')}
          </LinkButton>
        )}
      </Box>
      <Box
        sx={{
          backgroundColor: 'secondary',
          padding: 5,
          borderRadius: 'default',
        }}
      >
        <Box>
          <Button
            fullWidth
            onClick={handleClick}
            size="compact"
            variant="secondary"
          >
            {cta}
          </Button>
        </Box>
        {fileName ? (
          <>
            <Box sx={{ marginY: 5 }}>
              <Divider />
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="body-3">{fileName}</Typography>
              </Box>
              <IconButton aria-label={t('remove')} onClick={handleRemove}>
                <IcoTrash16 color="error" />
              </IconButton>
            </Box>
          </>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row',
                gap: 3,
                marginY: 5,
              }}
            >
              <Divider />
              <Typography color="quaternary" variant="body-4">
                {t('or')}
              </Typography>
              <Divider />
            </Box>
            {children}
          </>
        )}
      </Box>
      <HiddenInput
        accept={accept}
        ref={inputRef}
        type="file"
        onChange={handleChange}
      />
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
