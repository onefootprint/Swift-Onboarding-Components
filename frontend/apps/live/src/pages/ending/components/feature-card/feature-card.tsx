import { Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type FeatureCardProps = {
  title: string;
  children: React.ReactNode;
  description: string;
};

const FeatureCard = ({ title, description, children }: FeatureCardProps) => (
  <Container>
    <CardTitle>
      {children}
      <Text as="h3" variant="label-2">
        {title}
      </Text>
    </CardTitle>
    <Text as="p" variant="body-2" sx={{ width: '100%' }}>
      {description}
    </Text>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: left;
    padding: ${theme.spacing[5]};
    gap: ${theme.spacing[4]};
  `};
`;

const CardTitle = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
    width: 100%;

    h3 {
      width: 100%;
    }
  `};
`;

export default FeatureCard;
