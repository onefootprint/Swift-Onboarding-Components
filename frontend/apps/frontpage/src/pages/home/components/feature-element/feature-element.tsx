import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type FeatureElementType = {
  title: React.ReactNode;
  body: React.ReactNode;
  children: React.ReactNode;
  colorTheme?: 'light' | 'dark';
};

const FeatureElement = ({
  children,
  title,
  body,
  colorTheme = 'light',
}: FeatureElementType) => (
  <Container>
    <TitleContainer>
      {children}
      <Typography
        as="h3"
        color={colorTheme === 'dark' ? 'quinary' : 'primary'}
        variant="label-2"
      >
        {title}
      </Typography>
    </TitleContainer>
    <Typography
      as="p"
      color={colorTheme === 'dark' ? 'quinary' : 'secondary'}
      variant="body-2"
    >
      {body}
    </Typography>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
    width: 100%;
    text-align: left;
  `}
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[3]};
  `}
`;

export default FeatureElement;
