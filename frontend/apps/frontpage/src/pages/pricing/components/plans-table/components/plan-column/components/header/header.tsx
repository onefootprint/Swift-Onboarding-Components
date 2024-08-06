import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { type HeaderProps } from '../../../../plans-table-types';

const Header = ({ title, price }: HeaderProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.pricing' });

  const USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  });

  const renderPrice = (
    priceDetails: {
      monthly?: number;
      yearly?: number;
    } = {},
  ) => {
    const { monthly, yearly } = priceDetails;
    if (monthly && yearly) {
      return (
        <Stack direction="row" gap={2}>
          <Text variant="label-3">
            {t('units.from')} {USDollar.format(monthly)}
          </Text>
          <Text variant="label-3">{t('units.per-month')}</Text>
        </Stack>
      );
    }
    return null;
  };

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
        <Text variant="heading-3">{title}</Text>
        {renderPrice(price)}
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
