import { Text, Toggle } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { VerificationChecksFormData } from 'src/pages/playbooks/utils/machine/types';
import styled, { css } from 'styled-components';

const KycCheck = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog.verification-checks.kyc-check',
  });
  const { watch, setValue } = useFormContext<VerificationChecksFormData>();
  const shouldRunKyc = watch('skipKyc') !== true;
  const [isChecked, setIsChecked] = useState(shouldRunKyc);

  useEffect(() => {
    setValue('skipKyc', !isChecked);
  }, [isChecked, setValue]);

  return (
    <Container>
      <Text variant="label-2" color="secondary">
        {t('title')}
      </Text>
      <Toggle
        label={t('toggle.label')}
        hint={t('toggle.hint')}
        checked={isChecked}
        onChange={() => {
          setIsChecked(prev => !prev);
        }}
      />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

export default KycCheck;
