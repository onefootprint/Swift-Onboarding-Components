import { IcoCheckCircle24 } from '@onefootprint/icons';
import { Box, Button, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type PlanProps = {
  cta: string;
  features: string[];
  featureTitle?: string;
  onCtaClick: () => void;
  price: string;
  subtitle: string;
  title: string;
};

const Plan = ({
  cta,
  features,
  featureTitle,
  onCtaClick,
  price,
  subtitle,
  title,
}: PlanProps) => (
  <Container>
    <Typography variant="heading-3" sx={{ marginBottom: 3 }}>
      {title}
    </Typography>
    <Typography color="secondary" sx={{ marginBottom: 7 }} variant="body-1">
      {subtitle}
    </Typography>
    <Typography variant="label-2" color="success" sx={{ marginBottom: 5 }}>
      {price}
    </Typography>
    <CtaContainer>
      <Button fullWidth onClick={onCtaClick}>
        {cta}
      </Button>
    </CtaContainer>
    {featureTitle && (
      <Typography variant="label-2" sx={{ marginBottom: 5 }}>
        {featureTitle}
      </Typography>
    )}
    <Features>
      {features.map(feature => (
        <li key={feature}>
          <Box>
            <IcoCheckCircle24 />
          </Box>
          <Typography variant="body-2" color="secondary">
            {feature}
          </Typography>
        </li>
      ))}
    </Features>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    padding: ${theme.spacing[6]}px;
  `}
`;

const CtaContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[7]}px;
  `}
`;

const Features = styled.ul`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[3]}px;

    li {
      display: flex;
      gap: ${theme.spacing[3]}px;
    }
  `}
`;

export default Plan;
