import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type FeatureElementType = {
  title: React.ReactNode;
  body: React.ReactNode;
  children: React.ReactNode;
};

const FeatureElement = ({ children, title, body }: FeatureElementType) => (
  <CardWrapper>
    <TitleWrapper>
      {children}
      <Typography as="h3" color="primary" variant="label-2">
        {title}
      </Typography>
    </TitleWrapper>
    <Typography as="p" color="secondary" variant="body-2">
      {body}
    </Typography>
  </CardWrapper>
);

const CardWrapper = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
    width: 100%;
    text-align: left;
  `}
`;

const TitleWrapper = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[3]};
  `}
`;

export default FeatureElement;
