import { type DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { IcoTrash24 } from '@onefootprint/icons';
import { Button, LinkButton, Stack } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useCustomDocsValues from '../../hooks/use-custom-docs-values';
import CustomDocs from './components/custom-docs';

type FormProps = {
  onClose: () => void;
};

const Form = ({ onClose }: FormProps) => {
  const { t } = useTranslation('common');
  const { watch, setValue } = useFormContext<DataToCollectFormData>();
  const [originalValue] = useState(() => {
    return {
      custom: watch('business.docs.custom'),
    };
  });
  const {
    meta: { hasDoc },
  } = useCustomDocsValues();

  const handleCancel = () => {
    setValue('business.docs.custom', originalValue.custom);
    onClose();
  };

  const handleRemoveAll = () => {
    setValue('business.docs.custom', []);
    onClose();
  };

  return (
    <Stack direction="column" gap={8}>
      <CustomDocs onCancel={handleCancel} />
      <Stack gap={4} direction="column">
        <Button variant="primary" fullWidth onClick={onClose}>
          {t('save')}
        </Button>
        <Button variant="secondary" fullWidth onClick={handleCancel}>
          {t('cancel')}
        </Button>
        <Stack justifyContent="center">
          <LinkButton
            destructive
            iconComponent={IcoTrash24}
            iconPosition="left"
            onClick={handleRemoveAll}
            variant="label-4"
            disabled={!hasDoc}
          >
            {t('remove-all')}
          </LinkButton>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Form;
