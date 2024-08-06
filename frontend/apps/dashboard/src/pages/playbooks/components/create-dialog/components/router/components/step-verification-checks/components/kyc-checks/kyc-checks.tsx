import { Divider, Radio, Stack, Text, Toggle, Tooltip } from '@onefootprint/ui';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  KycOptionsForBeneficialOwners,
  type VerificationChecksFormData,
} from 'src/pages/playbooks/utils/machine/types';
import styled, { css } from 'styled-components';

type KycChecksProps = {
  isKyb?: boolean;
  collectBO?: boolean;
  requiresDoc?: boolean;
};

const KycChecks = ({ isKyb, collectBO, requiresDoc }: KycChecksProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.verification-checks.kyc-checks' });
  const { watch, setValue, register } = useFormContext<VerificationChecksFormData>();
  const shouldRunKyc = watch('skipKyc') !== true;
  const [isChecked, setIsChecked] = useState(shouldRunKyc);
  const isKybWithBo = isKyb && collectBO;
  const toggleDisabled = (!isKyb && !requiresDoc) || (isKyb && !collectBO);

  useEffect(() => {
    setValue('skipKyc', !isChecked);
  }, [isChecked, setValue]);

  return (
    <Container>
      <Text variant="label-2" color="secondary">
        {t('title')}
      </Text>
      <Tooltip
        text={isKyb ? t('disabled-tooltip.must-collect-beneficial-owners') : t('disabled-tooltip.must-collect-id-doc')}
        disabled={!toggleDisabled}
      >
        <Toggle
          label={isKyb ? t('toggle.business.label') : t('toggle.personal.label')}
          hint={isKyb ? t('toggle.business.hint') : t('toggle.personal.hint')}
          checked={isChecked}
          disabled={toggleDisabled}
          onChange={() => {
            setIsChecked(prev => !prev);
          }}
        />
      </Tooltip>
      {isKybWithBo && shouldRunKyc && (
        <>
          <Divider variant="secondary" />
          <Stack direction="column" gap={3}>
            <Radio
              label={t('bo-options.only-primary-bo')}
              hint={t('bo-options.only-primary-bo-hint')}
              value={KycOptionsForBeneficialOwners.primary}
              {...register('kycOptionForBeneficialOwners')}
            />
            <Radio
              label={t('bo-options.all-bos')}
              value={KycOptionsForBeneficialOwners.all}
              {...register('kycOptionForBeneficialOwners')}
            />
          </Stack>
        </>
      )}
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

export default KycChecks;
