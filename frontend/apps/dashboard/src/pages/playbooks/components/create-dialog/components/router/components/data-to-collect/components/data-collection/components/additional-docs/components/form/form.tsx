import { type DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { IcoTrash24 } from '@onefootprint/icons';
import { Button, Checkbox, Divider, LinkButton, Stack } from '@onefootprint/ui';
import React, { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useAdditionalDocs from '../../hooks/use-additional-docs';
import CustomDocs from './components/custom-docs';

type FormProps = {
  onClose: () => void;
};

const Form = ({ onClose }: FormProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.data-to-collect.additional-docs',
  });
  const { watch, setValue, register } = useFormContext<DataToCollectFormData>();
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
      <Stack gap={4} direction="column">
        <Checkbox label={t('form.poa.label')} hint={t('form.poa.hint')} {...register('personal.additionalDocs.poa')} />
        <Checkbox
          label={t('form.possn.label')}
          hint={t('form.possn.hint')}
          {...register('personal.additionalDocs.possn')}
        />
        <Divider variant="secondary" />
        <CustomDocs />
      </Stack>
      <Stack gap={4} direction="column">
        <Button variant="primary" fullWidth onClick={onClose}>
          {allT('save')}
        </Button>
        <Button variant="secondary" fullWidth onClick={handleCancel}>
          {allT('cancel')}
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
            {allT('remove-all')}
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
