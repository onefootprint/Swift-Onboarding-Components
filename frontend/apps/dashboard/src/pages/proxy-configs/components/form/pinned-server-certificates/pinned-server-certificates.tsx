import { IcoFileText224, IcoPlusSmall16 } from '@onefootprint/icons';
import { LinkButton, TextArea, Typography } from '@onefootprint/ui';
import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type {
  FormData,
  StepProps,
} from 'src/pages/proxy-configs/proxy-configs.types';

import FormGrid from '../form-grid';
import UploadFile from '../upload-file';

const defaultValue = { certificate: '' };

const PinnedServerCertificates = ({ id, onSubmit, values }: StepProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.proxy-configs.create.form.pinned-server-certificates',
  });
  const { control, handleSubmit, register, setValue } = useForm<FormData>({
    defaultValues: {
      pinnedServerCertificates: values.pinnedServerCertificates,
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'pinnedServerCertificates',
  });

  const handleAdd = () => {
    append(defaultValue);
  };

  const handleRemove = (index: number) => () => {
    remove(index);
  };

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="label-2" sx={{ marginBottom: 5 }}>
        {t('title')}
      </Typography>
      <FormGrid>
        {fields.map((field, index) => (
          <UploadFile
            accept=".pem, .crt"
            cta={t('certificate.cta')}
            iconComponent={IcoFileText224}
            id={`certificate.${index}`}
            key={field.id}
            label={t('certificate.label')}
            onChange={value =>
              setValue(`pinnedServerCertificates.${index}.certificate`, value)
            }
            onRemove={fields.length >= 2 ? handleRemove(index) : undefined}
          >
            <TextArea
              autoFocus
              id={`certificate.${index}`}
              placeholder={t('certificate.placeholder')}
              {...register(`pinnedServerCertificates.${index}.certificate`)}
            />
          </UploadFile>
        ))}
      </FormGrid>
      <LinkButton
        iconComponent={IcoPlusSmall16}
        iconPosition="left"
        onClick={handleAdd}
        size="compact"
      >
        {t('add-more')}
      </LinkButton>
    </form>
  );
};

export default PinnedServerCertificates;
