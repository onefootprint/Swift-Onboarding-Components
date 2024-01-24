import styled, { css } from '@onefootprint/styled';
import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { type HeaderProps } from '../../../../plans-table-types';

const Header = ({ title, price }: HeaderProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.pricing' });
  const hasPrice = price && price.monthly && price.yearly;

  const USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  });

  return (
    <Container
      direction="column"
      paddingTop={5}
      paddingBottom={5}
      paddingLeft={7}
      paddingRight={7}
      gap={2}
      justify="center"
    >
      <Stack direction="column" gap={2}>
        <Typography variant="heading-3">{title}</Typography>
        {hasPrice ? (
          <Stack direction="column">
            <Stack direction="row" gap={2}>
              <Typography variant="label-3">
                {t('units.from')} {USDollar.format(price.monthly || 0)}
              </Typography>
              <Typography variant="label-3">{t('units.per-month')}</Typography>
            </Stack>
          </Stack>
        ) : (
          <Typography variant="body-3" color="tertiary">
            {t('contact-us')}
          </Typography>
        )}
      </Stack>
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    position: relative;
    &::before {
      content: '';
      opacity: 0.5;
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background: radial-gradient(
        50% 50% at 20% 50%,
        ${theme.borderColor.primary} 0%,
        ${theme.borderColor.primary} 50%,
        ${theme.backgroundColor.primary} 100%
      );
    }
  `}
`;

export default Header;
