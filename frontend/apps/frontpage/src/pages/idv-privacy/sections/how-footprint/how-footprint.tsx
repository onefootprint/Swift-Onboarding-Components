import { Container, createFontStyles, media } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import FeatureCard from '../../components/feature-card';

const keys = [
  {
    id: 'id-document',
  },
  {
    id: 'match-photos',
    trans: {
      i18nKey: 'pages.idv-privacy.how.match-photos.description',
      components: {
        biometricIdLink: (
          <Link href="https://en.wikipedia.org/wiki/Biometrics" target="_blank" rel="noopener noreferrer" />
        ),
      },
    },
  },
  {
    id: 'databases',
  },
];

const HowFootprint = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.idv-privacy.how',
  });
  return (
    <StyledContainer>
      <LeftRail>
        <Title>{t('title')}</Title>
      </LeftRail>
      <RightRail>
        {keys.map(key => (
          <FeatureCard
            key={key.id}
            title={t(`${key.id}.title` as ParseKeys<'common'>)}
            description={t(`${key.id}.description` as ParseKeys<'common'>)}
            trans={key.trans}
          />
        ))}
      </RightRail>
    </StyledContainer>
  );
};

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    padding: ${theme.spacing[9]} 0;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[12]} ${theme.spacing[10]} ${theme.spacing[8]} ${theme.spacing[10]};
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr;
      grid-template-areas: 'left right';
    `}
  `}
`;

const Title = styled.h2`
  ${({ theme }) => css`
    ${createFontStyles('display-3')}
    padding: ${theme.spacing[8]} 0;
    color: ${theme.color.primary};
    max-width: 90%;
    margin: auto;
    text-align: center;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[4]} 0;
      max-width: 420px;
      position: sticky;
      text-align: left;
      width: 100%;
      top: 20%;
      grid-area: left;
    `}
  `}
`;

const LeftRail = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  grid-area: left;
`;

const RightRail = styled.div`
  ${({ theme }) => css`
    position: relative;
    height: 100%;
    width: 100%;
    grid-area: right;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing[8]};
    margin-bottom: ${theme.spacing[9]};

    ${media.greaterThan('md')`
      margin-bottom: 0;
      gap: ${theme.spacing[10]};
    `}
  `}
`;

export default HowFootprint;
