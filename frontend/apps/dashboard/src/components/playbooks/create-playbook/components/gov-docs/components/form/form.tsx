import { IcoTrash16 } from '@onefootprint/icons';
import { Button, LinkButton, Stack } from '@onefootprint/ui';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import type { GovDocsFormData } from '../../gov-docs.types';
import useDocs from '../../hooks/use-meta';
import CountrySpecificIdDocPicker from './components/country-specific-id-doc-picker';
import ExtraRequirements from './components/extra-requirements';
import GlobalIdDocPicker from './components/global-id-doc-picker';

type FormProps = {
  onClose: () => void;
};

const Form = ({ onClose }: FormProps) => {
  const { t } = useTranslation('common');
  const { watch, setValue } = useFormContext<GovDocsFormData>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [originalValue] = useState(() => {
    return {
      global: watch('gov.global'),
      country: watch('gov.country'),
      selfie: watch('gov.selfie'),
    };
  });
  const {
    meta: { hasDoc },
  } = useDocs();

  useEffect(() => {
    if (containerRef.current) {
      focusOnContainer(containerRef.current);
    }
  }, [containerRef]);

  const handleCancel = () => {
    setValue('gov.global', originalValue.global);
    setValue('gov.country', originalValue.country);
    setValue('gov.selfie', originalValue.selfie);
    onClose();
  };

  const handleRemoveAll = () => {
    setValue('gov.global', []);
    setValue('gov.country', {});
    onClose();
  };

  return (
    <Stack direction="column" gap={8} ref={containerRef}>
      <Container>
        <Section>
          <GlobalIdDocPicker />
        </Section>
        <Section>
          <CountrySpecificIdDocPicker />
        </Section>
        <Section>
          <ExtraRequirements />
        </Section>
      </Container>
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
            iconComponent={IcoTrash16}
            iconPosition="left"
            onClick={handleRemoveAll}
            variant="label-3"
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

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[6]};
  `};
`;

const Section = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `};
`;

export default Form;
