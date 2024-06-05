/* eslint-disable react/jsx-props-no-spreading */
import {
  Dialog,
  Form,
  LinkButton,
  Stack,
  Text,
  TextInput,
} from '@onefootprint/ui';
import Image from 'next/image';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

export type UploadDocDialogProps = {
  open: boolean;
  onClose: () => void;
};

type FormData = {
  identifier: string;
  document: FileList;
};

const UploadDocDialog = ({ open, onClose }: UploadDocDialogProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'header.actions.upload-doc',
  });
  const { t: allT } = useTranslation('common');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>();
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleOpenFile = () => {
    inputFileRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    const [file] = event.target.files;
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    setValue('document', event.target.files);
  };

  const handleClose = () => {
    setPreviewUrl(null);
    reset();
    onClose();
  };

  const onSubmit = () => {};

  return (
    <Dialog
      size="compact"
      title={t('label')}
      onClose={handleClose}
      open={open}
      primaryButton={{
        label: allT('save'),
        type: 'submit',
        form: 'upload-doc-form',
      }}
      secondaryButton={{
        label: allT('close'),
        onClick: handleClose,
      }}
    >
      <form id="upload-doc-form" onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={7} direction="column">
          <Form.Field>
            <Form.Label htmlFor="identifier">
              {t('form.identifier.label')}
            </Form.Label>
            <Form.Group>
              <Form.Addon>document.custom.</Form.Addon>
              <TextInput
                placeholder=""
                id="identifier"
                autoFocus
                {...register('identifier', {
                  required: t('form.identifier.errors.required'),
                })}
              />
            </Form.Group>
            <Form.Errors>{errors.identifier?.message}</Form.Errors>
          </Form.Field>
          <Form.Field>
            <Stack justifyContent="space-between" align="center">
              <Form.Label htmlFor="title">
                {t('form.document.label')}
              </Form.Label>
              {previewUrl && (
                <LinkButton
                  variant="label-4"
                  onClick={handleOpenFile}
                  $marginBottom={3}
                >
                  {t('form.document.upload-new')}
                </LinkButton>
              )}
            </Stack>
            {previewUrl ? (
              <DocPreview>
                <StyledImage
                  alt={t('form.document.preview-alt')}
                  fill
                  src={previewUrl}
                />
              </DocPreview>
            ) : (
              <DocUpload>
                <LinkButton variant="label-3" onClick={handleOpenFile}>
                  {t('form.document.cta')}
                </LinkButton>
                <Text variant="body-4" color="quaternary">
                  {t('form.document.supported-formats')}
                </Text>
              </DocUpload>
            )}
            <Form.Errors>{errors.document?.message}</Form.Errors>
            <HiddenInput
              accept="image/*"
              type="file"
              {...register('document', {
                required: t('form.document.errors.required'),
                onChange: handleChange,
              })}
              ref={inputFileRef}
            />
          </Form.Field>
        </Stack>
      </form>
    </Dialog>
  );
};

const DocSection = styled.div`
  ${({ theme }) => css`
    align-items: center;
    border-radius: ${theme.borderRadius.default};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
    height: 200px;
    justify-content: center;
    width: 452px;
    position: relative;
  `}
`;

const DocUpload = styled(DocSection)`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border: 1px dashed ${theme.borderColor.primary};
  `}
`;

const DocPreview = styled(DocSection)`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border: 1px solid ${theme.borderColor.primary};
  `}
`;

const StyledImage = styled(Image)`
  object-fit: contain;
`;

const HiddenInput = styled.input`
  display: none;
`;

export default UploadDocDialog;
