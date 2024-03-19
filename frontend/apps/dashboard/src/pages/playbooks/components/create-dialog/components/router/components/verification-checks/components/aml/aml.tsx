import { IcoWarning16 } from '@onefootprint/icons';
import { Checkbox, Divider, Stack, Text, Toggle } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { VerificationChecksFormData } from '@/playbooks/utils/machine/types';

export type AMLProps = {
  showError: boolean;
};

const AML = ({ showError }: AMLProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog.verification-checks.aml-monitoring',
  });
  const { register, watch } = useFormContext<VerificationChecksFormData>();
  const isAmlChecked = watch('amlFormData.enhancedAml');

  return (
    <Container>
      <Text variant="label-2" color="secondary">
        {t('title')}
      </Text>
      <Stack gap={5} direction="column">
        <Toggle
          label={t('aml.label')}
          hint={t('aml.hint')}
          checked={isAmlChecked}
          {...register('amlFormData.enhancedAml')}
        />
        {isAmlChecked && (
          <>
            <Divider variant="secondary" />
            <Checkbox
              label={t('ofac.label')}
              hint={t('ofac.hint')}
              {...register('amlFormData.ofac')}
            />
            <Checkbox
              label={t('pep.label')}
              hint={t('pep.hint')}
              {...register('amlFormData.pep')}
            />
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
