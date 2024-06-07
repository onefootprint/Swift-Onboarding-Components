import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { IcoEyeCrossed24, IcoFaceid24, IcoHelp24, IcoImages24 } from '@onefootprint/icons';
import { Container } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import IconFeatureCard from '../../components/icon-feature-card';
import Title from './components/title';

const verifyCards = [
  {
    key: 'capture',
    icon: IcoImages24,
  },
  {
    key: 'biometric-identifiers',
    icon: IcoEyeCrossed24,
    trans: {
      i18nKey: 'pages.idv-privacy.consent.verify.cards.biometric-identifiers.description',
      components: {
        mailLinkFootprint: <Link href="mailto:privacy@onefootprint.com" target="_blank" rel="noopener noreferrer" />,
        mailLinkIncode: <Link href="mailto:dataprotection@incode.com" target="_blank" rel="noopener noreferrer" />,
      },
    },
  },
  {
    key: 'comfortable',
    icon: IcoHelp24,
  },
];

const improveVendorCards = [
  {
    key: 'captured-images',
    icon: IcoFaceid24,
    trans: {
      i18nKey: 'pages.idv-privacy.consent.optional.cards.captured-images.description',
      components: {
        mailLinkFootprint: <Link href="mailto:privacy@onefootprint.com" target="_blank" rel="noopener noreferrer" />,
        mailLinkIncode: <Link href="mailto:dataprotection@incode.com" target="_blank" rel="noopener noreferrer" />,
      },
    },
  },
  {
    key: 'comfortable',
    icon: IcoHelp24,
    trans: {
      i18nKey: 'pages.idv-privacy.consent.optional.cards.comfortable.description',
      components: {
        privacyPolicyLink: (
          <Link href={`${FRONTPAGE_BASE_URL}/privacy-policy`} target="_blank" rel="noopener noreferrer" />
        ),
      },
    },
  },
];

const Consent = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.idv-privacy.consent',
  });
  return (
    <StyledContainer>
      <Title title={t('title')} subtitle={t('subtitle')} variant="primary" />
      <SubSection>
        <Title title={t('verify.title')} />
        <Divider />
        <Cards>
          {verifyCards.map(card => (
            <IconFeatureCard
              key={card.key}
              icon={card.icon}
              title={t(`verify.cards.${card.key}.title` as ParseKeys<'common'>)}
              description={t(`verify.cards.${card.key}.description` as ParseKeys<'common'>)}
              trans={card.trans}
            />
          ))}
        </Cards>
      </SubSection>
      <SubSection>
        <Title title={t('optional.title')} tag={t('optional.tag')} />
        <Divider />
        <Cards>
          {improveVendorCards.map(card => (
            <IconFeatureCard
              key={card.key}
              icon={card.icon}
              title={t(`optional.cards.${card.key}.title` as ParseKeys<'common'>)}
              description={t(`optional.cards.${card.key}.description` as ParseKeys<'common'>)}
              trans={card.trans}
            />
          ))}
        </Cards>
      </SubSection>
    </StyledContainer>
  );
};

const Divider = styled.span`
  ${({ theme }) => css`
    width: 100%;
    height: ${theme.borderWidth[2]};
    background: radial-gradient(
      50% 50% at 50% 50%,
      ${theme.borderColor.primary} 0%,
      ${theme.backgroundColor.primary} 100%
    );
  `}
`;

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[10]};
    padding: ${theme.spacing[11]} 0;
  `}
`;

const SubSection = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    &:last-child {
      margin-top: ${theme.spacing[9]};
    }
  `}
`;

const Cards = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: row;
    flex-wrap: wrap;
    gap: ${theme.spacing[5]};
  `}
`;

export default Consent;
