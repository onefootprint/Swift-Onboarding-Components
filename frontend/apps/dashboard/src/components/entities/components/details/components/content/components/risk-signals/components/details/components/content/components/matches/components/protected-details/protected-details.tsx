import { useTranslation } from '@onefootprint/hooks';
import { IcoShield40 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Button, createFontStyles, Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import { Trans } from 'react-i18next';

type ProtectedDetailsProps = {
  canDecrypt: boolean;
  onClick: () => void;
  isLoading: boolean;
};

const ProtectedDetails = ({
  canDecrypt,
  onClick,
  isLoading,
}: ProtectedDetailsProps) => {
  const { t } = useTranslation(
    'pages.entity.risk-signals.details.matches.protected-details',
  );

  return (
    <ProtectedSection>
      <IcoShield40 />
      <Typography variant="label-1">{t('title')}</Typography>
      <Typography variant="body-3">{t('description')}</Typography>
      {canDecrypt ? (
        <Button
          size="compact"
          loading={isLoading}
          onClick={onClick}
          sx={{ width: '75%' }}
        >
          {t('button')}
        </Button>
      ) : (
        <InstructionsBox>
          <Trans
            i18nKey="pages.entity.risk-signals.details.matches.protected-details.message"
            components={{
              admin: (
                <Link
                  href="https://dashboard.onefootprint.com/settings?tab=roles"
                  target="_blank"
                />
              ),
            }}
          />
        </InstructionsBox>
      )}
    </ProtectedSection>
  );
};

const ProtectedSection = styled.section`
  ${({ theme }) => css`
    padding: 0 ${theme.spacing[9]};
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: ${theme.spacing[5]};
  `}
`;

const InstructionsBox = styled.p`
  ${({ theme }) => css`
    padding: ${theme.spacing[5]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    ${createFontStyles('body-3')};
    color: ${theme.color.tertiary};
  `}
`;

export default ProtectedDetails;
