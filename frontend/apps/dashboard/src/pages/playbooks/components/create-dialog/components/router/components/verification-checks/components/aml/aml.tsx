import { IcoWarning16 } from '@onefootprint/icons';
import { Checkbox, Divider, Stack, Text, Toggle, Tooltip } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { VerificationChecksFormData } from '@/playbooks/utils/machine/types';

export type AMLProps = {
  showError: boolean;
  disabled?: boolean;
};

const AML = ({ showError, disabled }: AMLProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog.verification-checks.aml-monitoring',
  });
  const { register, watch, setValue } = useFormContext<VerificationChecksFormData>();
  const isAmlChecked = watch('amlFormData.enhancedAml');

  useEffect(() => {
    if (!isAmlChecked) {
      setValue('amlFormData.ofac', false);
      setValue('amlFormData.pep', false);
      setValue('amlFormData.adverseMedia', false);
    }
  }, [isAmlChecked, setValue]);

  return (
    <Container>
      <Text variant="label-2" color="secondary">
        {t('title')}
      </Text>
      <Stack gap={5} direction="column">
        <Tooltip disabled={!disabled} text={t('disabled-tooltip.must-collect-beneficial-owners')}>
          <Toggle
            label={t('aml.label')}
            hint={t('aml.hint')}
            checked={isAmlChecked}
            disabled={disabled}
            {...register('amlFormData.enhancedAml')}
          />
        </Tooltip>
        {isAmlChecked && (
          <>
            <Divider variant="secondary" />
            <Checkbox label={t('ofac.label')} hint={t('ofac.hint')} {...register('amlFormData.ofac')} />
            <Checkbox label={t('pep.label')} hint={t('pep.hint')} {...register('amlFormData.pep')} />
            <Checkbox
              label={t('adverse-media.label')}
              hint={t('adverse-media.hint')}
              {...register('amlFormData.adverseMedia')}
            />
            <Divider variant="secondary" />
            <Text variant="body-3" color="tertiary">
              <Text variant="body-3" color="primary" tag="span">
                {t('footer.label')}{' '}
              </Text>
              {t('footer.content')}
            </Text>
          </>
        )}
      </Stack>
      {showError && (
        <ErrorContainer>
          <IcoWarning16 color="error" />
          <Text variant="body-3" color="error">
            {t('missing-selection')}
          </Text>
        </ErrorContainer>
      )}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    white-space: pre-wrap;
  `};
`;

const ErrorContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[3]};
  `}
`;

export default AML;
