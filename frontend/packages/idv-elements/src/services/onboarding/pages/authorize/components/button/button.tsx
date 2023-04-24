import { useTranslation } from '@onefootprint/hooks';
import { FootprintButton, Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import { Trans } from 'react-i18next';
import styled, { css } from 'styled-components';

import useOnboardingMachine from '../../../../hooks/use-onboarding-machine';

type ButtonProps = {
  isLoading?: boolean;
  onClick: () => void;
};

const Button = ({ isLoading, onClick }: ButtonProps) => {
  const { t } = useTranslation('pages.authorize');
  const [state] = useOnboardingMachine();
  const { config } = state.context;

  if (!config) {
    return null;
  }
  const { orgName: tenantName, privacyPolicyUrl } = config;

  return (
    <ButtonContainer>
      <FootprintButton
        fullWidth
        loading={isLoading}
        onClick={onClick}
        text={t('cta')}
      />
      {privacyPolicyUrl && (
        <Typography
          variant="label-4"
          color="secondary"
          sx={{ textAlign: 'center' }}
        >
          <Trans
            i18nKey="pages.authorize.footer"
            values={{ tenantName }}
            components={{
              a: (
                <Link
                  href={privacyPolicyUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                />
              ),
            }}
          />
        </Typography>
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
