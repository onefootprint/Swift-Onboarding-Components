import { Text } from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const TWITTER_URL = 'https://twitter.com/Footprint_HQ';
const LINKEDIN_URL = 'https://www.linkedin.com/company/onefootprint';

const Footer = () => {
  const { t } = useTranslation('common', { keyPrefix: 'ending' });
  return (
    <Container>
      <LeftColumn>
        <Text tag="p" variant="label-4" color="tertiary">
          © {new Date().getFullYear()} One Footprint
        </Text>
      </LeftColumn>
      <RightColumn>
        <Link rel="noopener noreferrer" href={TWITTER_URL}>
          <Text variant="label-4" color="tertiary">
            {t('footer.twitter')}
          </Text>
        </Link>
        <Link rel="noopener noreferrer" href={LINKEDIN_URL}>
          <Text variant="label-4" color="tertiary">
            {t('footer.linkedin')}
          </Text>
        </Link>
        <Image src="/ending/soc-2-badge.png" alt="SOC 2" width={32} height={32} />
      </RightColumn>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding: ${theme.spacing[6]} ${theme.spacing[8]} ${theme.spacing[5]}
      ${theme.spacing[8]};
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    margin-top: ${theme.spacing[10]};
  `}
`;

const LeftColumn = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: flex-start;
    flex-direction: row;
    gap: ${theme.spacing[5]};
  `}
`;

const RightColumn = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[5]};

    a {
      text-decoration: none;
    }
  `}
`;

export default Footer;
