/* eslint-disable react/jsx-props-no-spreading */
import { Form, LinkButton, Stack, Text, TextInput } from '@onefootprint/ui';
import Image from 'next/image';
import React, { useRef, useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { FormData } from '../../upload-doc-dialog.types';

export type UploadDocFormProps = {
  onSubmit: SubmitHandler<FormData>;
};

const UploadDocForm = ({ onSubmit }: UploadDocFormProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'header.actions.upload-doc',
  });
  const [doc, setDoc] = useState<{ file: File; url: string } | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  const handleOpenFile = () => {
    inputFileRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    const [file] = event.target.files;
    setDoc({ url: URL.createObjectURL(file), file });
    setValue('file', file);
  };

  const isPdf = (file: File) => file.type === 'application/pdf';

  return (
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
          <Form.Errors>
            {errors.identifier ? errors.identifier.message : null}
          </Form.Errors>
        </Form.Field>
        <Form.Field>
          <Stack justifyContent="space-between" align="center">
            <Form.Label htmlFor="title">{t('form.file.label')}</Form.Label>
            {doc && (
              <LinkButton
                variant="label-4"
                onClick={handleOpenFile}
                $marginBottom={3}
              >
                {t('form.file.upload-new')}
              </LinkButton>
            )}
          </Stack>
          {doc ? (
            <>
              {isPdf(doc.file) ? (
                <DocPreviewContainer>
                  <DocSheet>
                    <DocPreview
                      src={`${doc.url}#page=1&view=FitH&toolbar=0&toolbar=0&navpanes=0&scrollbar=0`}
                    />
                  </DocSheet>
                </DocPreviewContainer>
              ) : (
                <ImagePreviewContainer>
                  <ImagePreview
                    alt={t('form.file.preview-alt')}
                    fill
                    src={doc.url}
                  />
                </ImagePreviewContainer>
              )}
              <Text variant="caption-4" marginTop={3} color="tertiary">
                {doc.file.name}
              </Text>
            </>
          ) : (
            <DocUpload>
              <LinkButton variant="label-3" onClick={handleOpenFile}>
                {t('form.file.cta')}
              </LinkButton>
              <Text variant="body-4" color="quaternary">
                {t('form.file.supported-formats')}
              </Text>
            </DocUpload>
          )}
          <Form.Errors>{errors.file ? errors.file.message : null}</Form.Errors>
          <HiddenInput
            accept="image/*, application/pdf"
            type="file"
            {...register('file', {
              required: t('form.file.errors.required'),
              onChange: handleChange,
            })}
            ref={inputFileRef}
          />
        </Form.Field>
      </Stack>
    </form>
  );
};

const DocSection = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
    height: 200px;
    width: 452px;
    position: relative;
    align-items: center;
    justify-content: center;
  `}
`;

const DocUpload = styled(DocSection)`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border: 1px dashed ${theme.borderColor.primary};
  `}
`;

const ImagePreviewContainer = styled(DocSection)`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border: 1px solid ${theme.borderColor.primary};
  `}
`;

const ImagePreview = styled(Image)`
  object-fit: contain;
`;

const DocPreviewContainer = styled(DocSection)`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border: 1px solid ${theme.borderColor.primary};
    justify-content: flex-end;
    padding-top: ${theme.spacing[5]};
    overflow: hidden;
  `}
`;

const DocSheet = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.sm} ${theme.borderRadius.sm} 0 0;
    box-shadow: ${theme.elevation[1]};
    width: 214px;
    height: 270px;
    position: relative;
    overflow: hidden;
    z-index: 1;
  `}
`;

const DocPreview = styled.iframe`
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  position: absolute;
  pointer-events: none;
  transform: translate(-2px, -2px);
`;

const HiddenInput = styled.input`
  display: none;
`;

export default UploadDocForm;
