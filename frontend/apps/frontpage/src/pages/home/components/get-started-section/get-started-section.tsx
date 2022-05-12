import React from 'react';
import styled, { css } from 'styled';
import { Button, Container, Typography } from 'ui';

type GetStartedSectionProps = {
  cta: string;
  subtitle: string;
  title: string;
};

const GetStartedSection = ({
  cta,
  subtitle,
  title,
}: GetStartedSectionProps) => (
  <Container id="get-started" as="section">
    <Inner>
      <Typography
        as="p"
        color="quaternary"
        sx={{ marginBottom: 5 }}
        variant="display-2"
      >
        {title}
      </Typography>
      <Typography
        as="p"
        color="quaternary"
        sx={{ marginBottom: 9 }}
        variant="body-1"
      >
        {subtitle}
      </Typography>
      <Button variant="secondary">{cta}</Button>
    </Inner>
  </Container>
);

const Inner = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    padding-bottom: ${theme.spacing[11]}px;
    text-align: center;
  `}
`;

export default GetStartedSection;
