import { FootprintButton, Text } from '@onefootprint/ui';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import useOnboardingRequirementsMachine from '../../../../hooks/use-onboarding-requirements-machine';

type ButtonProps = {
  isLoading?: boolean;
  onClick: () => void;
};

const Button = ({ isLoading, onClick }: ButtonProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'onboarding.pages.authorize',
  });
  const [state] = useOnboardingRequirementsMachine();
  const {
    onboardingContext: {
      config: { orgName: tenantName, privacyPolicyUrl },
    },
  } = state.context;

  return (
    <ButtonContainer>
      <FootprintButton
        fullWidth
        loading={isLoading}
        onClick={onClick}
        text={t('cta')}
        size="large"
        data-dd-action-name="authorize:cta"
      />
      {privacyPolicyUrl && (
        <Text variant="label-3" color="secondary" textAlign="center">
          <Trans
            ns="idv"
            i18nKey="onboarding.pages.authorize.footer"
            values={{ tenantName }}
            components={{
              a: <Link href={privacyPolicyUrl} rel="noopener noreferrer" target="_blank" />,
            }}
          />
        </Text>
      )}
    </ButtonContainer>
  );
};

const ButtonContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[4]};
  `}
`;

export default Button;
