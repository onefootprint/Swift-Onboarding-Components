import type { DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { IcoTrash16 } from '@onefootprint/icons';
import { Button, Checkbox, Divider, LinkButton, Stack } from '@onefootprint/ui';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AnimatedContainer from 'src/components/animated-container';
import useAdditionalDocs from '../../hooks/use-additional-docs';
import CustomDocs from './components/custom-docs';

type FormProps = {
  onClose: () => void;
};

const Form = ({ onClose }: FormProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.additional-docs',
  });
  const { watch, setValue, register } = useFormContext<DataToCollectFormData>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [originalValue] = useState(() => {
    return {
      poa: watch('person.docs.additional.poa'),
      possn: watch('person.docs.additional.possn'),
      custom: watch('person.docs.additional.custom'),
      requireManualReview: watch('person.docs.additional.requireManualReview'),
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
    setValue('person.docs.additional.poa', originalValue.poa);
    setValue('person.docs.additional.possn', originalValue.possn);
    setValue('person.docs.additional.custom', originalValue.custom);
    setValue('person.docs.additional.requireManualReview', originalValue.requireManualReview);
    onClose();
  };

  const handleRemoveAll = () => {
    setValue('person.docs.additional.poa', false);
    setValue('person.docs.additional.possn', false);
    setValue('person.docs.additional.custom', []);
    setValue('person.docs.additional.requireManualReview', false);
    onClose();
  };

  return (
    <Stack direction="column" gap={8} ref={containerRef}>
      <Stack gap={4} direction="column">
        <Checkbox label={t('form.poa.label')} hint={t('form.poa.hint')} {...register('person.docs.additional.poa')} />
        <Checkbox
          label={t('form.possn.label')}
          hint={t('form.possn.hint')}
          {...register('person.docs.additional.possn')}
        />
        <Divider variant="secondary" />
        <CustomDocs />
        <AnimatedContainer isExpanded={hasDoc}>
          <Stack gap={4} direction="column">
            <Divider variant="secondary" />
            <Checkbox
              label={t('form.require-manual-review.label')}
              hint={t('form.require-manual-review.description')}
              {...register('person.docs.additional.requireManualReview')}
            />
          </Stack>
        </AnimatedContainer>
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
            iconComponent={IcoTrash16}
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
