/* eslint-disable @typescript-eslint/no-unused-vars */
import { Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

export type DetailCardProps = {
  type: string; // onboarding or auth
  deviceInfo: { appClip: boolean; instantApp: boolean; web: boolean };
  hasBiometrics: boolean;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  city: string | null;
  country: string | null;
  region: string;
  regionName: string;
  isSelected?: boolean;
};

const DetailCard = ({
  city,
  country,
  hasBiometrics,
  ipAddress,
  deviceInfo,
  region,
  regionName,
  userAgent,
  type,
  timestamp,
  isSelected,
}: DetailCardProps) => (
  // TODO: Implement the contents of the cards when designs are finalized
  <Container data-selected={!!isSelected}>
    <Header data-selected={!!isSelected}>
      <Text variant="caption-1">{type}</Text>
    </Header>
    <Details>
      <DetailsRow>
        <Text variant="body-3" color="tertiary">
          TODO
        </Text>
        <Text variant="body-3">{timestamp}</Text>
      </DetailsRow>
      <DetailsRow>
        <Text variant="body-3" color="tertiary">
          TODO
        </Text>
        <Text variant="body-3">{userAgent}</Text>
      </DetailsRow>
    </Details>
  </Container>
);
const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};

    &[data-selected='true'] {
      background-color: rgb(245, 243, 252);
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.secondary};
    }
  `};
`;

const Header = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: ${theme.spacing[3]};
    width: 100%;
    height: 100%;
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default} ${theme.borderRadius.default} 0
      0;

    &[data-selected='true'] {
      background-color: rgb(235, 233, 250);
      border-bottom: ${theme.borderWidth[1]} solid
        ${theme.borderColor.secondary};
    }
  `};
`;

const Details = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: ${theme.spacing[3]};
    width: 100%;
    height: 100%;
    padding: ${theme.spacing[5]};
    gap: ${theme.spacing[5]};
  `};
`;

const DetailsRow = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: ${theme.spacing[3]};
  `};
`;

export default DetailCard;
