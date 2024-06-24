import { Container, Text, media } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ApitureLogo, ComposerLogo, FindigsLogo, GridLogo, YieldStreet } from 'src/components/company-logos/themed';
import TreasuryPrimeLogo from 'src/components/company-logos/themed/treasury-prime';
import styled, { css, useTheme } from 'styled-components';

import Line from '../../components/line';

const OtherCustomers = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.customers.other-customers',
  });

  const theme = useTheme();
  return (
    <SectionContainer>
      <TitleContainer>
        <Text variant="display-2" tag="h2">
          {t('title')}
        </Text>
        <Text variant="display-4" color="secondary" tag="h4">
          {t('subtitle')}
        </Text>
      </TitleContainer>
      <LogoGrid>
        <FindigsLogo color={theme.color.secondary} />
        <TreasuryPrimeLogo color={theme.color.secondary} />
        <GridLogo color={theme.color.secondary} />
        <YieldStreet color={theme.color.secondary} />
        <ComposerLogo color={theme.color.secondary} />
        <ApitureLogo color={theme.color.secondary} />
        <Line variant="vertical" position={{ left: '0%' }} />
        <Line variant="vertical" position={{ right: '0%' }} />
        <Line variant="horizontal" position={{ top: '0%' }} />
        <Line variant="horizontal" position={{ bottom: '0%' }} />
        <MobileLine>
          <Line variant="vertical" position={{ left: '50%' }} />
          <Line variant="horizontal" position={{ top: 'calc(100% * 1/3)' }} />
          <Line variant="horizontal" position={{ top: 'calc(100% * 2/3)' }} />
        </MobileLine>
        <DesktopLines>
          <Line variant="vertical" position={{ left: 'calc(100% * 1/3)' }} />
          <Line variant="horizontal" position={{ top: '50%' }} />
          <Line variant="vertical" position={{ left: 'calc(100% * 2/3)' }} />
        </DesktopLines>
      </LogoGrid>
    </SectionContainer>
  );
};

const SectionContainer = styled(Container)`
  ${({ theme }) => css`
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing[4]};
  `}
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing[4]};
    text-align: center;
  `}
`;

const LogoGrid = styled(Container)`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 180px);
    place-items: center;

    ${media.greaterThan('md')`
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(2, 180px);
      margin: ${theme.spacing[9]} 0 ${theme.spacing[11]} 0;
    `}
  `}
`;

const MobileLine = styled.div`
  display: block;

  ${media.greaterThan('md')`
    display: none;
    flex-direction: row;
    width: 100%;
    height: 100%;
  `}
`;

const DesktopLines = styled.div`
  display: none;

  ${media.greaterThan('md')`
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
    gap: 10px;
  `}
`;

export default OtherCustomers;
