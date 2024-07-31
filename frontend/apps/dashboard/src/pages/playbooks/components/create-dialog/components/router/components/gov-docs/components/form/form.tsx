import { type DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { IcoTrash24 } from '@onefootprint/icons';
import { Button, LinkButton, Stack } from '@onefootprint/ui';
import React, { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import useDocs from '../../hooks/use-docs';
import CountrySpecificIdDocPicker from './components/country-specific-id-doc-picker';
import ExtraRequirements from './components/extra-requirements';
import GlobalIdDocPicker from './components/global-id-doc-picker';

type FormProps = {
  onClose: () => void;
};

const Form = ({ onClose }: FormProps) => {
  const { t } = useTranslation('common');
  const { watch, setValue } = useFormContext<DataToCollectFormData>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [originalValue] = useState(() => {
    return {
      global: watch('personal.docs.global'),
      country: watch('personal.docs.country'),
      selfie: watch('personal.docs.selfie'),
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
    setValue('personal.docs.global', originalValue.global);
    setValue('personal.docs.country', originalValue.country);
    setValue('personal.docs.selfie', originalValue.selfie);
    onClose();
  };

  const handleRemoveAll = () => {
    setValue('personal.docs.global', []);
    setValue('personal.docs.country', {});
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
