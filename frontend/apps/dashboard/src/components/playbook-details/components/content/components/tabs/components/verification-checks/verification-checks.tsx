import { CollectedKybDataOption, type OnboardingConfig, OnboardingConfigKind } from '@onefootprint/types';
import { Stack, createFontStyles } from '@onefootprint/ui';
import { Trans, useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import Info from '../info';
import { isAmlCheck, isKybCheck, isKycCheck } from './verification-checks.utils';

export type VerificationChecksProps = {
  playbook: OnboardingConfig;
};

const VerificationChecks = ({
  playbook: { kind, verificationChecks, mustCollectData, skipKyc },
}: VerificationChecksProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.verification-checks' });

  const kyb = verificationChecks.find(isKybCheck);
  const kyc = verificationChecks.find(isKycCheck);
  const aml = verificationChecks.find(isAmlCheck);

  const kybText = (() => {
    if (kind === OnboardingConfigKind.kyc) return null;
    if (kyb?.data) {
      return kyb.data.einOnly ? t('kyb.ein-only') : t('kyb.full');
    }
    return (
      <Trans
        ns="playbooks"
        i18nKey="details.verification-checks.kyb.none"
        components={{
          b: <Bold />,
        }}
      />
    );
  })();

  const kycText = (() => {
    if (kind === OnboardingConfigKind.kyb) {
      if (skipKyc)
        return (
          <Trans
            ns="playbooks"
            i18nKey="details.verification-checks.kyb.kyc.none"
            components={{
              b: <Bold />,
            }}
          />
        );
      if (mustCollectData.includes(CollectedKybDataOption.beneficialOwners)) return t('kyb.kyc.primary-only');
      if (mustCollectData.includes(CollectedKybDataOption.kycedBeneficialOwners)) return t('kyb.kyc.full');
    }
    if (kind === OnboardingConfigKind.kyc) {
      return kyc ? (
        t('kyc.full')
      ) : (
        <Trans
          ns="playbooks"
          i18nKey="details.verification-checks.kyc.none"
          components={{
            b: <Bold />,
          }}
        />
      );
    }
    return null;
  })();

  return (
    <Stack flexDirection="column" gap={8}>
      {kybText && (
        <Info.Group title={t('kyb.title')}>
          <InfoText>{kybText}</InfoText>
        </Info.Group>
      )}
      {kycText && (
        <Info.Group title={t('kyc.title')}>
          <InfoText>{kycText}</InfoText>
        </Info.Group>
      )}
      <Info.Group title={t('aml.title')}>
        {aml ? (
          <>
            <Info.Item label={t('aml.ofac')} checked={aml.data.ofac} />
            <Info.Item label={t('aml.pep')} checked={aml.data.pep} />
            <Info.Item label={t('aml.adverse-media')} checked={aml.data.adverseMedia} />
          </>
        ) : (
          <Info.EmptyItem>
            <Trans
              ns="playbooks"
              i18nKey="details.verification-checks.aml.none"
              components={{
                b: <Bold />,
              }}
            />
          </Info.EmptyItem>
        )}
      </Info.Group>
    </Stack>
  );
};

const Bold = styled.b`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    color: ${theme.color.primary};
  `}
`;

const InfoText = styled.p`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    color: ${theme.color.tertiary};
  `}
`;

export default VerificationChecks;
