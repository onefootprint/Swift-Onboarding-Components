import { AuthorizedOrg, AuthorizedOrgOnboarding } from '@onefootprint/types';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';

type VerifiedAccountCardProps = {
  org: AuthorizedOrg;
};

const VerifiedAccountCard = ({ org }: VerifiedAccountCardProps) => {
  if (!org.onboardings.length) {
    return null;
  }

  const sortedOnboardingTimes = org.onboardings
    .map((onboarding: AuthorizedOrgOnboarding) => onboarding.timestamp)
    .sort();
  const latestOnboarding =
    sortedOnboardingTimes[sortedOnboardingTimes.length - 1];
  const date = new Date(latestOnboarding);
  const dateString = [date.getMonth(), date.getDay(), date.getFullYear()].join(
    '\\',
  );

  return (
    <Container>
      <ImageContainer>
        {org.logoUrl ? (
          <Image
            alt={`${org.name} Logo`}
            src={org.logoUrl}
            height={110}
            width={180}
            priority
            layout="fixed"
          />
        ) : (
          <Typography variant="label-3">{org.name}</Typography>
        )}
      </ImageContainer>
      <Footer>
        <Typography variant="caption-1" color="tertiary">
          on {dateString}
        </Typography>
      </Footer>
    </Container>
  );
};

const ImageContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    height: 110px;
    border-radius: ${theme.borderRadius[2]}px ${theme.borderRadius[2]}px 0 0;
    display: flex;
    align-items: center;
    justify-content: center;
  `};
`;

const Footer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    height: 32px;
    border-radius: 0 0 ${theme.borderRadius[2]}px ${theme.borderRadius[2]}px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${theme.backgroundColor.secondary};
    border-top: 1px solid ${theme.borderColor.tertiary};
  `};
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    width: 180px;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    border: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius[2]}px;
  `};
`;

export default VerifiedAccountCard;
