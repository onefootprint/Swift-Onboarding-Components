import { IcoTrash16 } from '@onefootprint/icons';
import { Button, Checkbox, Divider, LinkButton, Stack } from '@onefootprint/ui';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AnimatedContainer from 'src/components/animated-container';

import type { AdditionalDocsFormData } from '../additional-docs.types';
import useMeta from '../hooks/use-meta';
import CustomDocs from './custom-docs';

type FormProps = {
  onClose: () => void;
};

const Form = ({ onClose }: FormProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.additional-docs' });
  const { watch, setValue, register } = useFormContext<AdditionalDocsFormData>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [originalValue] = useState(() => {
    return {
      poa: watch('docs.poa'),
      possn: watch('docs.possn'),
      custom: watch('docs.custom'),
      requireManualReview: watch('docs.requireManualReview'),
    };
  });
  const {
    meta: { hasDoc },
  } = useMeta();

  useEffect(() => {
    if (containerRef.current) {
      focusOnContainer(containerRef.current);
    }
  }, [containerRef]);

  const handleCancel = () => {
    setValue('docs.poa', originalValue.poa);
    setValue('docs.possn', originalValue.possn);
    setValue('docs.custom', originalValue.custom);
    setValue('docs.requireManualReview', originalValue.requireManualReview);
    onClose();
  };

  const handleRemoveAll = () => {
    setValue('docs.poa', false);
    setValue('docs.possn', false);
    setValue('docs.custom', []);
    setValue('docs.requireManualReview', false);
    onClose();
  };

  return (
    <Stack direction="column" gap={8} ref={containerRef}>
      <Stack gap={4} direction="column">
        <Checkbox label={t('form.poa.label')} hint={t('form.poa.hint')} {...register('docs.poa')} />
        <Checkbox label={t('form.possn.label')} hint={t('form.possn.hint')} {...register('docs.possn')} />
        <Divider variant="secondary" />
        <CustomDocs />
        <AnimatedContainer isExpanded={hasDoc}>
          <Stack gap={4} direction="column">
            <Divider variant="secondary" />
            <Checkbox
              label={t('form.require-manual-review.label')}
              hint={t('form.require-manual-review.description')}
              {...register('docs.requireManualReview')}
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
            variant="label-3"
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
