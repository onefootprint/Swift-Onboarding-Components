import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';

const TWITTER_URL = 'https://twitter.com/Footprint_HQ';
const LINKEDIN_URL = 'https://www.linkedin.com/company/onefootprint';

const Footer = () => {
  const { t } = useTranslation('common', { keyPrefix: 'ending' });
  return (
    <Container>
      <LeftColumn>
        <Typography as="p" variant="label-4" color="tertiary">
          © {new Date().getFullYear()} One Footprint
        </Typography>
      </LeftColumn>
      <RightColumn>
        <Link rel="noopener noreferrer" href={TWITTER_URL}>
          <Typography variant="label-4" color="tertiary">
            {t('footer.twitter')}
          </Typography>
        </Link>
        <Link rel="noopener noreferrer" href={LINKEDIN_URL}>
          <Typography variant="label-4" color="tertiary">
            {t('footer.linkedin')}
          </Typography>
        </Link>
        <Image
          src="/ending/soc-2-badge.png"
          alt="SOC 2"
          width={32}
          height={32}
        />
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
