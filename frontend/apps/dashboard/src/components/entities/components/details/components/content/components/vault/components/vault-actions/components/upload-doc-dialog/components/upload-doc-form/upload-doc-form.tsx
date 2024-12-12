import { Form, LinkButton, TextInput } from '@onefootprint/ui';
import Image from 'next/image';
import { useRef, useState } from 'react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormData } from '../../upload-doc-dialog.types';

export type UploadDocFormProps = {
  onSubmit: SubmitHandler<FormData>;
};

const UploadDocForm = ({ onSubmit }: UploadDocFormProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'header-default.actions.upload-doc',
  });
  const [doc, setDoc] = useState<{ file: File; url: string } | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  const isPdf = (file: File) => {
    return file.type === 'application/pdf';
  };

  const handleOpenFile = () => {
    inputFileRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    const [file] = event.target.files;
    setDoc({ url: URL.createObjectURL(file), file });
    setValue('file', file);
  };

  return (
    <form id="upload-doc-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-6">
        <Form.Field>
          <Form.Label htmlFor="identifier">{t('form.identifier.label')}</Form.Label>
          <Form.Group>
            <Form.Addon>document.custom.</Form.Addon>
            <TextInput
              placeholder=""
              id="identifier"
              hasError={!!errors.identifier}
              autoFocus
              {...register('identifier', {
                required: t('form.identifier.errors.required'),
              })}
            />
          </Form.Group>
          <Form.Errors>{errors.identifier?.message}</Form.Errors>
        </Form.Field>
        <Form.Field>
          <div className="flex justify-between items-center">
            <Form.Label htmlFor="title">{t('form.file.label')}</Form.Label>
            {doc && (
              <LinkButton variant="label-3" onClick={handleOpenFile}>
                {t('form.file.upload-new')}
              </LinkButton>
            )}
          </div>
          {doc ? (
            <>
              {isPdf(doc.file) ? (
                <div className="flex flex-col gap-2 h-[200px] w-[452px] relative items-center justify-end pt-4 overflow-hidden bg-secondary border border-solid border-primary rounded">
                  <div className="rounded-t-sm shadow-elevation-1 w-[214px] h-[270px] relative overflow-hidden z-10">
                    <iframe
                      title="PDF Preview"
                      className="w-[calc(100%+4px)] h-[calc(100%+4px)] absolute pointer-events-none -translate-x-[2px] -translate-y-[2px]"
                      src={`${doc.url}#page=1&view=FitH&toolbar=0&toolbar=0&navpanes=0&scrollbar=0`}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 h-[200px] w-[452px] relative items-center justify-center bg-secondary border border-solid border-primary rounded">
                  <Image alt={t('form.file.preview-alt')} fill src={doc.url} className="object-contain" />
                </div>
              )}
              <p className="text-caption-4 text-tertiary mt-3">{doc.file.name}</p>
            </>
          ) : (
            <div className="flex flex-col gap-1 h-[200px] w-[452px] relative items-center justify-center bg-primary border border-dashed border-primary rounded">
              <LinkButton variant="label-3" onClick={handleOpenFile}>
                {t('form.file.cta')}
              </LinkButton>
              <p className="text-body-3 text-quaternary">{t('form.file.supported-formats')}</p>
            </div>
          )}
          <Form.Errors>{errors.file?.message}</Form.Errors>
          <input
            className="hidden"
            accept="image/*, application/pdf"
            type="file"
            {...register('file', {
              required: t('form.file.errors.required'),
              onChange: handleChange,
            })}
            ref={inputFileRef}
          />
        </Form.Field>
      </div>
    </form>
  );
};

export default UploadDocForm;
