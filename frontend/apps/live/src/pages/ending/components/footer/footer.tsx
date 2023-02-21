import {
  IcoLinkedin24,
  IcoTwitter24,
  LogoFpCompact,
} from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';

const TWITTER_URL = 'https://twitter.com/Footprint_HQ';
const LINKEDIN_URL = 'https://www.linkedin.com/company/onefootprint';
const FOOTPRINT_URL = 'https://www.onefootprint.com/';

const Footer = () => (
  <Container>
    <LeftColumn>
      <Link href={FOOTPRINT_URL} rel="noopener noreferrer">
        <LogoFpCompact />
      </Link>
      <Typography as="p" variant="label-4" color="tertiary">
        © {new Date().getFullYear()} One Footprint
      </Typography>
      <Image src="/ending/soc-2-badge.png" alt="SOC 2" width={32} height={32} />
    </LeftColumn>
    <RightColumn>
      <Link rel="noopener noreferrer" href={TWITTER_URL}>
        <IcoTwitter24 color="tertiary" />
      </Link>
      <Link rel="noopener noreferrer" href={LINKEDIN_URL}>
        <IcoLinkedin24 color="tertiary" />
      </Link>
    </RightColumn>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding: ${theme.spacing[10]} ${theme.spacing[8]};
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    margin-top: ${theme.spacing[10]};
  `}
`;

const LeftColumn = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

const RightColumn = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[5]};
  `}
`;

export default Footer;
