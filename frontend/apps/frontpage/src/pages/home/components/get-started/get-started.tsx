import React from 'react';
import styled, { css } from 'styled';
import { Button, Container, Typography } from 'ui';

type GetStartedProps = {
  ctaText: string;
  subtitleText: string;
  titleText: string;
};

const GetStarted = ({ titleText, subtitleText, ctaText }: GetStartedProps) => (
  <Container id="get-started" as="section">
    <Inner>
      <Typography
        as="p"
        color="quaternary"
        sx={{ marginBottom: 5 }}
        variant="display-2"
      >
        {titleText}
      </Typography>
      <Typography
        as="p"
        color="quaternary"
        sx={{ marginBottom: 9 }}
        variant="body-1"
      >
        {subtitleText}
      </Typography>
      <Button variant="secondary">{ctaText}</Button>
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

export default GetStarted;
