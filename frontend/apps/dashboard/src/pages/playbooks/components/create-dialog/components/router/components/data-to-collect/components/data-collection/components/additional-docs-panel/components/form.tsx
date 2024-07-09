import { type DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { IcoTrash24 } from '@onefootprint/icons';
import { Button, LinkButton, Stack } from '@onefootprint/ui';
import React, { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useAdditionalDocs from '../hooks/use-additional-docs';

type FormProps = {
  children?: React.ReactNode;
  onClose: () => void;
};

const Form = ({ children, onClose }: FormProps) => {
  const { t } = useTranslation('common');
  const { watch, setValue } = useFormContext<DataToCollectFormData>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [originalValue] = useState(() => {
    return {
      poa: watch('personal.additionalDocs.poa'),
      possn: watch('personal.additionalDocs.possn'),
      custom: watch('personal.additionalDocs.custom'),
    };
  });
  const {
    meta: { hasDoc },
  } = useAdditionalDocs();

  useEffect(() => {
    if (containerRef.current) {
      focusOnContainer(containerRef.current);
    }
  }, [containerRef]);

  const handleCancel = () => {
    setValue('personal.additionalDocs.poa', originalValue.poa);
    setValue('personal.additionalDocs.possn', originalValue.possn);
    setValue('personal.additionalDocs.custom', originalValue.custom);
    onClose();
  };

  const handleRemoveAll = () => {
    setValue('personal.additionalDocs.poa', false);
    setValue('personal.additionalDocs.possn', false);
    setValue('personal.additionalDocs.custom', []);
    onClose();
  };

  return (
    <Stack direction="column" gap={8} ref={containerRef}>
      {children}
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

const focusOnContainer = (el: HTMLDivElement) => {
  el.scrollIntoView({ behavior: 'smooth' });
};

export default Form;
