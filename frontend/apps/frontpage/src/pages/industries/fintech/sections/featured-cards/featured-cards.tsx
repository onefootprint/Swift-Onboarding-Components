import { Container } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import FeaturedCard from 'src/pages/industries/components/featured-card';
import RequestMoreInfo from 'src/pages/industries/components/featured-card-illustrations/request-more-info';
import VaultData from 'src/pages/industries/components/featured-card-illustrations/vault-data';
import VerifyIdentities from 'src/pages/industries/components/featured-card-illustrations/verify-identities';
import styled, { css } from 'styled-components';

const keys = [
  {
    key: 'verify-identities',
    illustration: <VerifyIdentities />,
  },
  {
    key: 'verify-credit',
    illustration: <RequestMoreInfo />,
  },
  {
    key: 'detect-fraud',
    illustration: <VaultData />,
  },
];

const FeaturedCards = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.industries.fintech.featured',
  });
  return (
    <Background>
      <CardsContainer>
        {keys.map(({ key, illustration }) => (
          <FeaturedCard
            key={key}
            title={t(`${key}.title` as unknown as ParseKeys<'common'>)}
            subtitle={t(`${key}.subtitle` as unknown as ParseKeys<'common'>)}
            illustration={illustration}
          />
        ))}
      </CardsContainer>
    </Background>
  );
};

const CardsContainer = styled(Container)`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    grid-template-rows: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${theme.spacing[3]};
  `}
`;

const Background = styled.div`
  ${({ theme }) => css`
    background: linear-gradient(
      to bottom,
      transparent 0%,
      ${theme.backgroundColor.secondary} 100%
    );
  `}
`;
export default FeaturedCards;
